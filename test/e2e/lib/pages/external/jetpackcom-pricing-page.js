/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container.js';
import * as driverHelper from '../../driver-helper.js';

export default class JetpackComPricingPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = 'https://jetpack.com/pricing/';
		}
		super( driver, By.css( '.plans-pricing-comparison' ), url );
	}

	async buyPremium() {
		const buyPremiumSelector = By.css( 'a[href*="premium"]' );
		return await driverHelper.clickWhenClickable( this.driver, buyPremiumSelector );
	}
}
