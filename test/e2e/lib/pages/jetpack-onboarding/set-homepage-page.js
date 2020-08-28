/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container.js';
import * as driverHelper from '../../driver-helper.js';

export default class SetHomepagePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.steps__main[data-e2e-type="homepage"]' ) );
	}

	async selectPosts() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.card[data-e2e-type="posts"] button' )
		);
	}

	async selectPage() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.card[data-e2e-type="page"] button' )
		);
	}
}
