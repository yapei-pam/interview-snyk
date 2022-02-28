import React from 'react';
import { useState, useEffect } from 'react';
import { Graphviz } from 'graphviz-react';
import axios from 'axios';
import './App.css';

export type DependencyType = {
	[key: string]: string
}

function App() {
	const [search, setSearch] = useState({
		packageName: '',
		version: '',
	});
	const [ modules, setModules] = useState([]);
	const [ showGraph, setShowGraph] = useState(false);
	const [ error, setError] = useState('');
	// TODO: Do more granular error handling
	// TODO: Add loading state

	// TODO: Extract into /utils and unit test this
	// TODO: Differentiate between dependencies and devDependencies
	const getDependencies = (async (
			{ packageName, version }: { packageName: string, version?: string }
		): Promise<{ dependencies?: DependencyType,  query: string; }> => {

		try {

			const fetchResult = await axios({
				method: 'get',
				url: `/api/package/${packageName}/${version || undefined}`,
			})

			const { dependencies, query } = fetchResult?.data || [];

			return ({ dependencies, query });
		} catch (error) {
			setError('Sorry, something went wrong, please try another module')
		}
	})

	// TODO: Extract into /utils and unit test this
	const formatDisplayVersion = (version: string) => {
		const numIndex = version.search(/\d/);
		return `@${version.slice(numIndex)}`;
	}

	// TODO: Extract into /utils and unit test this
	const doSearch = async (event) => {
		// TODO: extract out logic and refactor
		event.preventDefault();
		const { packageName, version } = search;
		const { dependencies, query } = await getDependencies({ packageName, version });

		if (dependencies) {
			setError('');
			const collectedPackageResult = [{ name: query, parent: null }];
			const result = Object.entries(dependencies).map(async ([key, value]) => {
				collectedPackageResult.push({ name: key.concat(formatDisplayVersion(value)), parent: query  })
				const searchVersion = value.replace(/[^0-9.]+/g,'');
				try {
					const { dependencies, query }  = await getDependencies({ packageName: key, version: searchVersion  || 'latest'});
					if (dependencies && Object.keys(dependencies).length) {
						Object.entries(dependencies).map(async ([key, value]) => {
							collectedPackageResult.push({ name: key.concat(formatDisplayVersion(value)), parent: query })
						})
					}
				} catch(error) {
					// TODO: handle error handling properly
					console.error('Error searching package', error)
					setError('Error finding package, please try another')
				}
			})
			await Promise.all(result);
			return setModules(collectedPackageResult)
		}
		return setError('No related dependencies for this module, please try another')
	}

	// TODO: Extract into /utils and unit test this
	const composeDOT = (dependencies: DependencyType[]) => {
		const diagraphArray = dependencies.map(({ name, parent }) => {
			if (parent) {
				return `"${parent}" -> "${name}";`
			}
			return `"${name}";`
		})
		return `digraph {
			${diagraphArray.join('')}
		}`
	}

	useEffect(() => {
		if (modules.length) {
			setShowGraph(true);
		}
		if (error) {
			setShowGraph(false);
		}
	}, [modules, error]);

	return (
    <div className="App">
      <div className="App-container">
				<div className="App-header">
					<p>
						NPM Registry
					</p>
					<form onSubmit={doSearch} className="form-container">
						<div className="input-container">
							<label className="input-label">Name (Required)</label>
							<input
									name="package-name-input"
									className="input-field"
									type="text"
									value={search.packageName}
									id="name-search-field"
									onChange={(e) => setSearch({ ...search, packageName: e.currentTarget.value })}
									placeholder={'\u{1F50D} \xa0Enter module name'}
									autoFocus
							/>
						</div>
						<div className="input-container">
							<label className="input-label">Version (Optional)</label>
							<input
									name="package-version-input"
									className="input-field"
									type="text"
									value={search.version}
									id="version-search-field"
									onChange={(e) => setSearch({ ...search, version: e.currentTarget.value })}
									placeholder={'\u{1F50D} \xa0Enter module version'}
									autoFocus
							/>
						</div>
						<div className="search-input-container" >
							<input type="submit" value="Search" />
						</div>
					</form>
				</div>
				<div className="error-container">
					{ error && !showGraph &&
						<>
							{error}
						</>
					}
				</div>
				<div className="graph">
					{ showGraph &&
						<>
							<Graphviz
								dot={composeDOT(modules)}
								options={{
									height: 800,   // TODO: Make height,width viewport dynamic
									width: 800,    // TODO: Make Graph Horizontal
									zoom: true
								}}
							/>
						</>
					}
				</div>
      </div>
    </div>
  );
}

export default App;
