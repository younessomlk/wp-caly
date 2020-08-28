/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container.js';
import * as driverHelper from '../../driver-helper.js';

export default class JetpackComSearchLandingPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = 'https://jetpack.com/upgrade/search';
		}
		super( driver, By.css( '.page-template-landing-page-search' ), url );
	}

	async upgrade() {
		const buyPremiumSelector = By.css( '#landing-page-search-primary-cta' );
		return await driverHelper.clickWhenClickable( this.driver, buyPremiumSelector );
	}
}
