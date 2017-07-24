import React from 'react';
import ReactDOM from 'react-dom';
import MeasurementsViewer from './MeasurementsViewer';
import renderer from 'react-test-renderer';

// const fixture = 'data: [{"name":"Batt. Voltage","unit":"V","measurements":[],"_id":"5971e022c0d1420001edb3bd"}]';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MeasurementsViewer />, div);
});

it('renders correctly', () => {
  const tree = renderer.create(
    <MeasurementsViewer />
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

//TODO: add more tests