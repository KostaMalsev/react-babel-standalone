const CounterComponent = ({ onIncrement, onDecrement, value }) => (
    <div>
        <h1>Counter: {value}</h1>
        <div class="button-container">
            <button onClick={onIncrement}>+</button>
            <button onClick={onDecrement}>-</button>
        </div>
    </div>
);



//Adding JSX components:
function formatName(user) {
  return user.firstName + ' ' + user.lastName;
}

const user = {
  firstName: 'Harper',
  lastName: 'Perez'
};

const element1 = (
  <h1>
    Hello, {formatName(user)}!
  </h1>
);


class RootComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: 0
        };
    }

    render(element) {
        return <CounterComponent
            value={this.state.value}
            onIncrement={() => {
                this.setState({
                    value: this.state.value + 1
                });
            }}
            onDecrement={() => {
                this.setState({
                    value: this.state.value - 1
                });
            }}
        />;
    }

}




ReactDOM.render(element1,
    <RootComponent />,
    document.getElementById('root')
);
