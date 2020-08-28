/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper.js';
import AsyncBaseContainer from '../../async-base-container.js';

export default class WooWizardReadyPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'div.wc-setup-content ul.wc-wizard-next-steps' ) );
	}

	async selectContinue() {
		return await driverHelper.clickWhenClickable( this.driver, By.css( 'button.button-next' ) );
	}
}
