/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from './login-flow.js';
import SidebarComponent from '../components/sidebar-component.js';
import AddNewSitePage from '../pages/add-new-site-page.js';
import PickAPlanPage from '../pages/signup/pick-a-plan-page.js';
import WporgCreatorPage from '../pages/wporg-creator-page.js';
import JetpackAuthorizePage from '../pages/jetpack-authorize-page.js';
import WPAdminJetpackPage from '../pages/wp-admin/wp-admin-jetpack-page.js';
import WPAdminSidebar from '../pages/wp-admin/wp-admin-sidebar.js';
import WPAdminLogonPage from '../pages/wp-admin/wp-admin-logon-page.js';
import WPAdminInPlaceApprovePage from '../pages/wp-admin/wp-admin-in-place-approve-page.js';
import WPAdminInPlacePlansPage from '../pages/wp-admin/wp-admin-in-place-plans-page.js';
import * as driverManager from '../driver-manager.js';
import * as driverHelper from '../driver-helper.js';
import * as dataHelper from '../data-helper.js';
import JetpackConnectPage from '../pages/jetpack/jetpack-connect-page.js';
// import NoticesComponent from '../components/notices-component.js';

export default class JetpackConnectFlow {
	constructor( driver, account, template ) {
		this.driver = driver;
		this.account = account;
		this.template = template;
	}

	async createJNSite() {
		global.__JNSite = true;

		const wporgCreator = await WporgCreatorPage.Visit(
			this.driver,
			WporgCreatorPage._getCreatorURL( this.template )
		);

		await wporgCreator.waitForWpadmin( this.template );
		this.url = await wporgCreator.getUrl();
		this.password = await wporgCreator.getPassword();
		this.username = await wporgCreator.getUsername();
	}

	async connectFromCalypso() {
		await driverManager.ensureNotLoggedIn( this.driver );
		await this.createJNSite();
		const loginFlow = new LoginFlow( this.driver, this.account );
		await loginFlow.loginAndSelectMySite();
		const sidebarComponent = await SidebarComponent.Expect( this.driver );
		await sidebarComponent.addNewSite( this.driver );
		const addNewSitePage = await AddNewSitePage.Expect( this.driver );
		await addNewSitePage.addSiteUrl( this.url );

		const connectPage = await JetpackConnectPage.Expect( this.driver );
		await connectPage.waitToDisappear();

		const jetpackAuthorizePage = await JetpackAuthorizePage.Expect( this.driver );
		await jetpackAuthorizePage.waitToDisappear();

		const pickAPlanPage = await PickAPlanPage.Expect( this.driver );
		return await pickAPlanPage.selectFreePlanJetpack();
	}

	async connectFromWPAdmin() {
		await driverManager.ensureNotLoggedIn( this.driver );
		await this.createJNSite();
		await WPAdminSidebar.refreshIfJNError( this.driver );
		const wpAdminSidebar = await WPAdminSidebar.Expect( this.driver );
		await wpAdminSidebar.selectJetpack();
		await driverHelper.refreshIfJNError( this.driver );
		const wpAdminJetpack = await WPAdminJetpackPage.Expect( this.driver );
		await wpAdminJetpack.connectWordPressCom();
		const loginFlow = new LoginFlow( this.driver, this.account );
		await loginFlow.loginUsingExistingForm();
		const jetpackAuthorizePage = await JetpackAuthorizePage.Expect( this.driver );
		await jetpackAuthorizePage.approveConnection();
		await jetpackAuthorizePage.waitToDisappear();
		const pickAPlanPage = await PickAPlanPage.Expect( this.driver );
		return await pickAPlanPage.selectFreePlanJetpack();
	}

	async inPlaceConnectFromWPAdmin() {
		await driverManager.ensureNotLoggedIn( this.driver );
		const loginFlow = new LoginFlow( this.driver, 'jetpackConnectUser' );
		await loginFlow.login();
		await this.createJNSite();
		await WPAdminSidebar.refreshIfJNError( this.driver );
		await ( await WPAdminSidebar.Expect( this.driver ) ).selectJetpack();
		await driverHelper.refreshIfJNError( this.driver );
		await ( await WPAdminJetpackPage.Expect( this.driver ) ).inPlaceConnect();
		await ( await WPAdminInPlaceApprovePage.Expect( this.driver ) ).approve();
		await ( await WPAdminInPlacePlansPage.Expect( this.driver ) ).selectFreePlan();
		return await WPAdminJetpackPage.Expect( this.driver );
	}

	async removeSites( timeout = config.get( 'mochaTimeoutMS' ) ) {
		const timeStarted = Date.now();
		await new LoginFlow( this.driver, this.account ).loginAndSelectMySite();

		const removeSites = async () => {
			const sidebarComponent = await SidebarComponent.Expect( this.driver );
			const siteRemoved = await sidebarComponent.removeBrokenSite();
			if ( ! siteRemoved || Date.now() - timeStarted > 0.8 * timeout ) {
				// 80% of timeout
				// no sites left to remove or removeSites taking too long
				return;
			}
			// seems like it is not waiting for this
			// const noticesComponent = await NoticesComponent.Expect( this.driver );
			// await noticesComponent.dismissNotice();
			return await removeSites();
		};

		return await removeSites();
	}

	async disconnectFromWPAdmin( account ) {
		// 'Login into wporg site'
		const user = dataHelper.getAccountConfig( account );
		await driverManager.clearCookiesAndDeleteLocalStorage( this.driver );
		const loginPage = await WPAdminLogonPage.Visit( this.driver, user[ 2 ] );
		await loginPage.login( user[ 0 ], user[ 1 ] );

		// 'Can navigate to the Jetpack dashboard'
		const wpAdminSidebar = await WPAdminSidebar.Expect( this.driver );
		await wpAdminSidebar.selectJetpack();

		// 'Can disconnect site if connected'
		const wpAdminJetpack = await WPAdminJetpackPage.Expect( this.driver );
		if ( ! ( await wpAdminJetpack.atAGlanceDisplayed() ) ) return;
		return await wpAdminJetpack.disconnectSite();
	}
}
