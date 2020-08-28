/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container.js';

export default class MyOwnDomainPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.use-your-domain-step__content' ) );
	}

	async selectBuyDomainMapping() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.use-your-domain-step__option-button:not(.is-primary)' )
		);
	}

	async selectTransferDomain() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.use-your-domain-step__option-button.is-primary' )
		);
	}
}
