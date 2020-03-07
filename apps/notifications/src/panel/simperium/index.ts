import createClient from './simperium-lib';
import { wpcom } from '../rest-client/wpcom';
import tabLock from './tab-lock';

const APP_ID = localStorage.getItem( 'wpnotes_app_id' );

type EntityId = string;
type ISO8601String = string;

interface Entity< T > {
	id: EntityId;
	data: T;
	version: number;
}

interface Bucket< T > {
	get( id: EntityId ): Promise< Entity< T > >;
	find(): Promise< Entity< T >[] >;
	on( eventName: string, listener: Function ): void;
	update( id: EntityId, data: T ): void;
}

interface Meta {
	last_seen: number;
}

interface Note {
	body: object;
	header: object;
	icon: string;
	id: number;
	meta: object;
	noticon: string;
	read: 1 | 0;
	subject: object;
	timestamp: ISO8601String;
	title: string;
	type: string;
	url: string;
}

interface SimperiumClient {
	bucket< T >( name: string ): Bucket< T >;
	connect(): void;
	disconnect(): void;
}

interface ConnectedState {
	client: SimperiumClient;
	meta: Bucket< Meta >;
	note: Bucket< Note >;
	announce( message: object ): void;
}

interface DisconnectedState {
	client: SimperiumClient | null;
	announce( message: object ): void;
}

type Message =
	| { type: 'connect' }
	| { type: 'disconnect' }
	| { type: 'get-all-notes' }
	| { type: 'read-note'; noteId: EntityId; note: Note }
	| { type: 'meta.index' }
	| { type: 'meta.update'; lastSeenTime: number }
	| { type: 'note.index' }
	| { type: 'note.update'; noteId: EntityId; note: Note }
	| { type: 'note.remove'; noteId: EntityId };

type Next = [ typeof connected, ConnectedState ] | [ typeof disconnected, DisconnectedState ];

async function connected(
	message: Message,
	state: ConnectedState,
	loopback: ( message: any ) => void
): Promise< Next > {
	switch ( message.type ) {
		case 'get-all-notes':
		case 'note.index':
			state.announce( {
				type: 'add-notes',
				notes: ( await state.note.find() ).map( ( { data } ) => data ),
			} );
			return [ connected, state ];

		case 'read-note':
			state.note.update( message.noteId, {
				...( await state.note.get( message.noteId ) ).data,
				read: 1,
			} );
			return [ connected, state ];

		case 'meta.index':
		case 'meta.update':
			state.announce( { type: 'update-last-seen', lastSeenTime: message.lastSeenTime } );
			return [ connected, state ];

		case 'note.update':
			state.announce( { type: 'add-notes', notes: [ message.note ] } );
			return [ connected, state ];

		case 'note.remove':
			state.announce( { type: 'remove-notes', noteIds: [ message.noteId ] } );
			return [ connected, state ];

		case 'disconnect':
			state.client.disconnect();
			return [ disconnected, { client: state.client, announce: state.announce } ];

		default:
			return [ connected, state ];
	}
}

async function disconnected(
	message: Message,
	state: DisconnectedState,
	loopback: ( message: any ) => void
): Promise< Next > {
	switch ( message.type ) {
		case 'connect':
			const client: SimperiumClient =
				state.client ||
				createClient(
					APP_ID,
					(
						await wpcom().req.post( {
							path: '/me/simperium-tokens/new',
							apiVersion: 'v1.1',
							body: { api_key: localStorage.getItem( 'wpnotes_api_key' ) },
						} )
					 ).token
				);

			state.client && client.connect();

			const meta = client.bucket< Meta >( 'meta' );
			const note = client.bucket< Note >( 'note' );

			// Remote events from Simperium
			meta.on( 'index', () => loopback( { type: 'meta.index' } ) );
			meta.on( 'update', ( id, data ) => loopback( { type: 'meta.update', lastSeenTime: 0 } ) );

			note.on( 'index', () => loopback( { type: 'note.index' } ) );
			note.on( 'update', ( noteId, note ) => loopback( { type: 'note.update', noteId, note } ) );
			note.on( 'remove', noteId => loopback( { type: 'note.remove', noteId } ) );

			return [ connected, { client, meta, note } ];

		case 'get-all-notes':
		case 'read-note':
			// request( message );
			return [ disconnected, state ];

		default:
			return [ disconnected, state ];
	}
}

const spawn = ( initialState: Next ) => {
	let state = initialState;

	const { port1, port2 } = new MessageChannel();
	const loopback = ( message: object ) => port2.postMessage( message );

	port1.onmessage = async ( event: { data: object } ) => {
		const [ run, prevState ] = state;
		state = await run( event.data, prevState, loopback );
	};

	return { send: loopback, port: port2 };
};

const machine = spawn( [
	disconnected,
	{
		client: null,
		announce: ( message: object ) =>
			localStorage.setItem(
				'wpnotes_last_data',
				JSON.stringify( {
					message,
					sentinel: Math.random(),
				} )
			),
	},
] );

// Tab-lock events
tabLock( 'wpnotes' ).onmessage = event => {
	switch ( event.data ) {
		case 'acquired-lock':
			machine.send( { type: 'connect' } );
			return;

		case 'lost-lock':
			machine.send( { type: 'disconnect' } );
			return;
	}
};

// Inbound requests and data from other tabs

/**
 * @TODO: We need something in here to create a unique
 *        reference for each request and then continue
 *        to resubmit the request until it gets fulfilled.
 *        Otherwise we might end up in a situation where
 *        the data never populates from a remote tab
 */

window.addEventListener( 'storage', event => {
	switch ( event.key ) {
		case 'wpnotes_last_event':
		case 'wpnotes_last_request':
			machine.send( event.newValue );
			return;
	}
} );

export default machine;
