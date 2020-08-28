/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container.js';
import * as dataHelper from '../../data-helper.js';
import * as driverHelper from '../../driver-helper.js';

export default class NewPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = NewPage.getGutenboardingURL();
		}
		super( driver, by.css( '.is-section-gutenboarding' ), url );
	}

	static getGutenboardingURL() {
		return dataHelper.getCalypsoURL( 'new' );
	}

	async waitForBlock() {
		return driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			by.css( '[data-type="automattic/onboarding"]' )
		);
	}
}
