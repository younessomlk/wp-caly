/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container.js';
import * as driverHelper from '../../driver-helper.js';

export default class DomainFirstPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.site-or-domain__choices' ) );
	}

	async chooseJustBuyTheDomain() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.site-or-domain__choices' )
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.site-or-domain__choice[data-e2e-type="domain"]' )
		);
	}
}
