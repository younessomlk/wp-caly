/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper.js';
import AsyncBaseContainer from '../../async-base-container.js';

export default class WooWizardIndustryPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.woocommerce-profile-wizard__checkbox-group' ) );
	}

	async selectFashionIndustry() {
		const fashionSelector = By.css( '#inspector-checkbox-control-2' );
		const buttonSelector = By.css( '.woocommerce-card button:not([disabled])' );
		await driverHelper.clickWhenClickable( this.driver, fashionSelector );
		return await driverHelper.clickWhenClickable( this.driver, buttonSelector );
	}
}
