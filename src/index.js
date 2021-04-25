import React from "react";
import ReactDOM from "react-dom";

const Slomux = React.createContext(null);

const createStore = (reducer, initialState) => {
  let currentState = initialState;
  let listeners = [];

  const getState = () => currentState;
  const dispatch = (action) => {
    currentState = reducer(currentState, action);
    listeners.forEach((listener) => listener());
  };

  // return unsubscribe (used for updating)
  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  };

  return { getState, dispatch, subscribe };
};

// use Slomux context
const useSelector = (selector) => {
  const context = React.useContext(Slomux);
  // Subcribe to Slomux & update on changes
  const [_, setState] = React.useState({});
  React.useEffect(() => {
    const unsubscribe = context?.store?.subscribe(() => setState({}));
    return () => {
      unsubscribe && unsubscribe();
    };
  }, []);

  if (!context) {
    return 0;
  }

  return selector(context.store.getState());
};

// use Slomux context
const useDispatch = () => {
  const context = React.useContext(Slomux);
  if (!context) {
    return () => {};
  }
  return context.store.dispatch;
};

// Remove redundant contex
const Provider = ({ store, children }) => {
  return <Slomux.Provider value={{ store }}>{children}</Slomux.Provider>;
};

// APP

// actions
const UPDATE_COUNTER = "UPDATE_COUNTER";
const CHANGE_STEP_SIZE = "CHANGE_STEP_SIZE";

// action creators
const updateCounter = (value) => ({
  type: UPDATE_COUNTER,
  payload: value,
});

const changeStepSize = (value) => ({
  type: CHANGE_STEP_SIZE,
  payload: value,
});

// reducers
const defaultState = {
  counter: 1,
  stepSize: 1,
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case UPDATE_COUNTER:
      return {
        ...state,
        counter:
          action.payload < 0
            ? state.counter - state.stepSize
            : state.counter + state.stepSize,
      };
    case CHANGE_STEP_SIZE:
      return { ...state, stepSize: action.payload };
    default:
      return state;
  }
};

const Step = () => {
  const stepSize = useSelector((state) => state.stepSize);
  const dispatch = useDispatch();

  return (
    <div>
      <div>
        Значение счётчика должно увеличиваться или уменьшаться на заданную
        величину шага
      </div>
      <div>Текущая величина шага: {stepSize}</div>
      <input
        type="range"
        min="1"
        max="5"
        value={stepSize}
        // Convert to number
        onChange={({ target }) => dispatch(changeStepSize(+target.value))}
      />
    </div>
  );
};

const Counter = () => {
  const counter = useSelector((state) => state.counter);
  const dispatch = useDispatch();

  return (
    <div>
      <button onClick={() => dispatch(updateCounter(-1))}>-</button>
      <span> {counter} </span>
      <button onClick={() => dispatch(updateCounter(1))}>+</button>
    </div>
  );
};

const store = createStore(reducer, defaultState);

ReactDOM.render(
  <Provider store={store}>
    <Step />
    <Counter />
  </Provider>,
  document.getElementById("app")
);
