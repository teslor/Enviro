import React from 'react';
import MeasurementsViewer from './MeasurementsViewer';
import './App.css';

//TODO: switch to Redux
class App extends React.Component {
  render() {
    return (
      <div className="app">
        <div className="viewer-container">
          <MeasurementsViewer
            source="https://jsdemo.envdev.io/sse"
						refreshRate={100}
          />
        </div>
      </div>
    );
	}
}

export default App;