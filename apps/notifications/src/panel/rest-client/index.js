import { store } from '../state';
import actions from '../state/actions';

import getNote from '../state/selectors/get-note';
import getAllNotes from '../state/selectors/get-all-notes';
import simperium from '../simperium';

export function Client() {
	this.isVisible = false;
	this.isShowing = false;
	this.lastSeenTime = null;
	this.hasIndexed = false;
	this.initialAnnouncement = null;

	store.dispatch( actions.ui.loadNotes() );
	this.announcer = simperium().port;

	this.announcer.onmessage = ( { data: [ name, value ] } ) => {
		switch ( name ) {
			case 'last-seen-time':
				this.lastSeenTime = value;
				break;
			case 'add-notes':
				if ( ! this.hasIndexed ) {
					store.dispatch( actions.ui.loadedNotes() );
				}
				this.hasIndexed = true;
				store.dispatch( actions.notes.addNotes( value ) );
				break;
			case 'remove-notes':
				store.dispatch( actions.notes.removeNotes( value ) );
				break;
		}

		this.ready();
	};

	const getInitialNotes = () => {
		if ( this.hasIndexed ) {
			return;
		}

		this.announcer.postMessage( [ 'get-all-notes' ] );
		setTimeout( getInitialNotes, 100 );
	};

	getInitialNotes();
}

Client.prototype.readNote = function( noteId ) {
	const note = getNote( store.getState(), noteId );

	if ( ! note ) {
		return;
	}

	this.announcer.postMessage( [ 'read-note', noteId, { ...note, read: 1 } ] );
};

/**
 * Reports new notification data if available
 *
 * New notification data is available _if_ we
 * have a note with a timestamp newer than we
 * did the last time we called this function.
 */
Client.prototype.ready = function ready( hasNewNote = false ) {
	if ( null === this.lastSeenTime || ! this.hasIndexed ) {
		clearTimeout( this.initialAnnouncement );
		this.initialAnnouncement = setTimeout( () => this.ready(), 50 );
		return;
	}

	const notes = getAllNotes( store.getState() );
	const timestamps = notes.map( note => Date.parse( note.timestamp ) / 1000 );
	const newNoteCount = timestamps.filter( time => time > this.lastSeenTime ).length;
	const latestType = notes.length ? notes.slice( -1 )[ 0 ].type : null;

	store.dispatch( {
		type: 'APP_RENDER_NOTES',
		hasNewNote: this.hasIndexed && hasNewNote,
		newNoteCount,
		latestType,
	} );
};

export default Client;
