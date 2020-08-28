/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container.js';

export default class MapADomainPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.map-domain-step' ) );
	}
}
