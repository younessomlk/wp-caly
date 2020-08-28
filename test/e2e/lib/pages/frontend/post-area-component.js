/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper.js';
import AsyncBaseContainer from '../../async-base-container.js';

export default class PostAreaComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'article.post' ) );
	}

	async getPostHTML() {
		const postSelector = By.css( '.post .entry-content' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, postSelector );
		return await this.driver.findElement( postSelector ).getAttribute( 'innerHTML' );
	}
}
