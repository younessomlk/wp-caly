/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container.js';
import * as driverHelper from '../../driver-helper.js';

export default class ContactFormPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.steps__main[data-e2e-type="contact-form"]' ) );
	}

	async selectAddContactForm() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.card[data-e2e-type="contact-form"] button' )
		);
	}

	async selectContinue() {
		const continueSelector = By.css( '.card[data-e2e-type="continue"] button' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, continueSelector );
		return await driverHelper.clickWhenClickable( this.driver, continueSelector );
	}
}
