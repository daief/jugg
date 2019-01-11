import * as React from 'react';

export class Child extends React.Component<any, {
  count: number
}> {
  state = {
    count: 1
  };

  onClick = () => {
    this.setState(
      ({ count }) => ({count: count + 1}),
      () => {
        // tslint:disable no-console
        console.log('click child console.log', this.state.count);
      }
    );
  }

  render() {
    return (
      <div>
        <h1>Child</h1>

        <div onClick={this.onClick}>
          click me: {this.state.count}
        </div>
      </div>
    );
  }
}