const createRandomId = ( length: number ): string => {
	if ( window.crypto && window.crypto.getRandomValues ) {
		const randomBytes = new Uint8Array( length );
		window.crypto.getRandomValues( randomBytes );

		return window.btoa( String.fromCharCode( ...randomBytes ) );
	}

	return new Array( length )
		.fill( null )
		.map( () => String.fromCharCode( Math.floor( Math.random() * 256 ) ) )
		.join( '' );
};

const safely = ( f: () => any ) => {
	try {
		return f();
	} catch ( e ) {
		return null;
	}
};

const load = ( key: string ) =>
	safely( () => {
		const data = localStorage.getItem( key );
		return data ? JSON.stringify( data ) : null;
	} );

const save = ( key: string, value: object ) =>
	safely( () => localStorage.setItem( key, JSON.stringify( value ) ) );

type Lock = [ string, number ];
type LockEvent = 'lock-already-taken' | 'acquired-lock' | 'lost-lock';

interface State {
	lastOwner: string | null;
	me: string;
	get(): Lock;
	set( lock: Lock ): void;
	send( event: LockEvent ): void;
	timeout: number;
}

const tick = ( state: State ): State => {
	const { get, lastOwner, me, send, set, timeout } = state;
	const now = Date.now();

	const [ lockOwner, lockSince ] = get();
	const wasMe = lastOwner === me;
	const isMe = lockOwner === me;

	const nextState = { ...state, lastOwner: lockOwner };

	// on boot fire event if the lock is unavailable
	if ( null === lastOwner && lockOwner && lockOwner !== me ) {
		send( 'lock-already-taken' );
		return nextState;
	}

	// if it's available though then take it
	if ( null === lockOwner ) {
		set( [ me, now ] );
		send( 'acquired-lock' );
		return { ...nextState, lastOwner: me };
	}

	// check if we got it - update if we did
	if ( ! wasMe && isMe ) {
		set( [ me, now ] );
		send( 'acquired-lock' );
		return nextState;
	}

	// we already have the lock - update it
	if ( wasMe && isMe ) {
		set( [ me, now ] );
		return nextState;
	}

	// if it's not being updated - try to take it
	if ( ! isMe && now - lockSince > timeout ) {
		set( [ me, now ] );
		return nextState;
	}

	// we lost it - announce it
	if ( wasMe && ! isMe ) {
		send( 'lost-lock' );
		return nextState;
	}

	return nextState;
};

export default ( prefix: string = 'tab_lock', rate = 1000, timeout = 5000 ) => {
	const { port1: port, port2: _port } = new MessageChannel();

	const get = () => load( `${ prefix }_tab_lock` ) || [ null, -Infinity ];
	const set = ( data: [ string, number ] ) => save( `${ prefix }_tab_lock`, data );
	const send = ( message: LockEvent ) => port.postMessage( message );

	let state: State = {
		get,
		lastOwner: null,
		me: `${ prefix }_${ createRandomId( 32 ) }`,
		send,
		set,
		timeout,
	};

	const run = ( loop: () => void ) => ( ( state = tick( state ) ), loop() );
	const loop = () => setTimeout( () => run( loop ), rate );

	run( loop );

	return _port;
};
