/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../async-base-container.js';

export default class RegistrationUnavailableComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.empty-content' ) );
	}
}
