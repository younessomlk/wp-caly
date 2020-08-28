/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container.js';
import * as driverHelper from '../../driver-helper.js';

export default class InstallWooCommercePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jetpack-onboarding' ) );
	}

	async selectSellOnline() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.steps__button-group a.button.is-primary' )
		);
	}
}
