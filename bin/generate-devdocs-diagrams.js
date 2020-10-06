#!/usr/bin/env node

/**
 * This script generates graphical diagrams for PlantUML markup to be embedded in
 * documentation. It finds all .puml files that are part of the Calypso repository
 * and writes a generated SVG to an .svg file of the same name.
 */

const fs = require( 'fs' );
const path = require( 'path' );
const globby = require( 'globby' );
const plantuml = require( 'node-plantuml' );

function main() {
	// Build a list of all .puml files in allowed subdirectories...
	const dirList = [
		'assets',
		'bin',
		'client',
		'config',
		'docs',
		'packages',
		'test',
		'.github',
	].map( ( dir ) => dir + '/**/*.puml' );
	// ... and the current directory
	dirList.push( '*.puml' );
	// don't descend into node_modules
	dirList.push( '!**/node_modules/**' );

	const diagrams = globby.sync( dirList );

	writeSearchIndex( diagrams );
}

/**
 * For each .puml file, strip the extension, replace it with .svg
 * and use the generator to create the diagram with the SVG format.
 */

function writeSearchIndex( diagrams ) {
	diagrams.forEach( ( diagram ) => {
		const ext = path.extname( diagram );
		const outputPath = diagram.substr( 0, diagram.lastIndexOf( ext ) ) + '.svg';
		const generator = plantuml.generate( diagram, { format: 'svg' } );
		generator.out.pipe( fs.createWriteStream( outputPath ) );
	} );
}

main();
