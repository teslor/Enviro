import React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import throttle from 'lodash/throttle';
import './MeasurementsViewer.css';

const STATUS = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  CONNECTING: 'Connecting',
};

/**
 * MeasurementsViewer connects to event source & shows received data/measurements in the table
 */
class MeasurementsViewer extends React.Component {
  constructor(props) {
    super(props);

    /**
		 * status - connection status
		 * items - measurements to show
		 */
    this.state = {
			status: STATUS.OFFLINE,
			items: [],
    };
  }

	/**
	 * Connects/disconnects to event source & sets event handlers
	 */
  toggleConnection() {
  	if (this.state.status === STATUS.CONNECTING) return;

  	if (!this.connection) {
  		if (!this.props.source) return;

			this.connection = new EventSource(this.props.source);

			// Set connection handlers

			const refreshRate = this.props.refreshRate ? this.props.refreshRate : 100;
			this.connection.onmessage = throttle(this.processMessage.bind(this), refreshRate);

			this.connection.onopen = () => {
				this.setState({ status: STATUS.ONLINE });
			};

			this.connection.onerror = (e) => {
				this.setState({ status: STATUS.OFFLINE });
			};

			this.setState({ status: STATUS.CONNECTING });
		} else {
  		this.connection.close();
  		this.connection = null;
  		this.setState({ status: STATUS.OFFLINE });
		}
	}

	/**
	 * Performs messages handling from event source & updates measurements to show
	 */
  processMessage(msg) {
		let data;

		try {
			data = JSON.parse(msg.data);
		} catch(err) {
			return;
		}

		let currentItems = cloneDeep(this.state.items);
		data.forEach((item) => {
			if (!item.name || !item.measurements || item.measurements.length < 1) {  // no name or measurements for this item
				return;
			}
			let lastMeasurement = item.measurements[item.measurements.length -  1];  //take the latest measurement

			let i, newItem;
			for (i = 0; i < currentItems.length; i += 1) {
				if (currentItems[i].data[0] !== item.name) {
					continue;
				}
				break;
			}
			if (i === currentItems.length) {
				newItem = {};
				currentItems.push(newItem);
			} else {
				newItem = currentItems[i];
			}

			newItem._id = item._id;
			newItem.data = [];
			newItem.data.push(item.name);
			newItem.data.push(item.unit);

			// TODO: use date formatting function if necessary
			// Time
			let time = new Date(lastMeasurement[0] * 1000).toString();
			time = time.match(/.+?(?= GMT)/)[0];
			newItem.data.push(time);

			// Value
			let value = lastMeasurement[1];
			switch(typeof value) {
				case 'number':
					value = value.toFixed(2);
					break;
				case 'object':  // location
					value = `${value[0]} ${value[1]}`;
					break;
				default:
			}
			newItem.data.push(value);
		});

		this.setState({ items: currentItems });
	}

	handleSwitchClick = () => {
		this.toggleConnection();
	};

  render() {
  	let content = [];
  	this.state.items.forEach((item) => {
  		item.data.forEach((dataItem, i) => {
  			let classes = 'box content';
  			let key = item._id;

				switch(i) {
					case 0:
						key = dataItem;
						break;
					case 1:
						classes += ' a-center';
						key += '1';
						break;
					case 2:
						classes += ' a-center';
						key += '2';
						break;
					case 3:
						classes += ' a-right';
						key += '3';
						break;
					default:
				}

				content.push(
					<div className={classes} key={key}>{dataItem}</div>
				)
			})
		});

  	if (!content.length) {
  	  content.push(
				<div className='box info' key='info'>No measurements to show</div>
			)
		}

		//TODO: possible improvement: color highlighting for values which require attention
    return (
    	<div className="measurements-viewer">
				<div className="measurements-viewer-header">
					<div className="box button" onClick={this.handleSwitchClick}>
						Turn {
						  this.state.status === STATUS.ONLINE ? 'Off' : (this.state.status === STATUS.OFFLINE ? 'On' : 'On...')
					  }
					</div>
					<div className="box header">Measurements</div>
					<div className="box button">{this.state.status}</div>
				</div>
				<div className="measurements-viewer-content">
					<div className="box header">Name</div>
					<div className="box header">Unit</div>
					<div className="box header">Time</div>
					<div className="box header">Value</div>
					{content}
				</div>
			</div>
    );
	}
}

export default MeasurementsViewer;