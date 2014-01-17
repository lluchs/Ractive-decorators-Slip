/*

	Ractive-decorators-Slip
	=======================

	Version <%= VERSION %>.

	<< description goes here... >>

	==========================

	Troubleshooting: If you're using a module system in your app (AMD or
	something more nodey) then you may need to change the paths below,
	where it says `require( 'Ractive' )` or `define([ 'Ractive' ]...)`.

	==========================

	Usage: Include this file on your page below Ractive, e.g:

	    <script src='lib/Ractive.js'></script>
	    <script src='lib/Ractive-decorators-Slip.js'></script>

	Or, if you're using a module loader, require this module:

	    // requiring the plugin will 'activate' it - no need to use
	    // the return value
	    require( 'Ractive-decorators-Slip' );

	<< more specific instructions for this plugin go here... >>

*/

(function ( global, factory ) {

	'use strict';

	// Common JS (i.e. browserify) environment
	if ( typeof module !== 'undefined' && module.exports && typeof require === 'function' ) {
		factory( require( 'Ractive' ), require( 'slip' ) );
	}

	// AMD?
	else if ( typeof define === 'function' && define.amd ) {
		define([ 'Ractive', 'slip' ], factory );
	}

	// browser global
	else if ( global.Ractive && global.Slip ) {
		factory( global.Ractive, global.Slip );
	}

	else {
		throw new Error( 'Could not find Ractive or Slip! They must be loaded before the Ractive-decorators-Slip plugin' );
	}

}( typeof window !== 'undefined' ? window : this, function ( Ractive, Slip ) {

	'use strict';

	var errorMessage;

	errorMessage = 'The Slip decorator only works with elements that correspond to array members';

	Ractive.decorators.Slip = function ( node ) {
		var slip;

		slip = new Slip( node );

		node.addEventListener( 'slip:reorder', extractRactiveArray( reorder ), false );
		node.addEventListener( 'slip:swipe', extractRactiveArray( swipe ), false );
		
		function reorder( e, ractive, keypath, index ) {
			var array = ractive.get( keypath ), source;

			// remove source from array
			source = array.splice( index, 1 )[0];
			// add source back to array in new location
			array.splice( e.detail.spliceIndex, 0, source );
		}

		function swipe( e, ractive, keypath, index ) {
			var array = ractive.get( keypath );

			// Remove item from array.
			array.splice( index, 1 );
		}

		return {
			teardown: function () {
				slip.detach();
				node.removeEventListener( 'slip:reorder', reorder, false );
				node.removeEventListener( 'slip:swipe', swipe, false );
			}
		};
	};

	function extractRactiveArray( fun ) {
		return function ( e ) {
			var storage = e.target._ractive, lastDotIndex, sourceKeypath, sourceArray, sourceIndex, ractive;

			sourceKeypath = storage.keypath;

			// this decorator only works with array members!
			lastDotIndex = sourceKeypath.lastIndexOf( '.' );

			if ( lastDotIndex === -1 ) {
					throw new Error( errorMessage );
			}

			sourceArray = sourceKeypath.substr( 0, lastDotIndex );
			sourceIndex = +( sourceKeypath.substring( lastDotIndex + 1 ) );

			ractive = storage.root;

			fun.call( this, e, ractive, sourceArray, sourceIndex );
		};
	}

}));
