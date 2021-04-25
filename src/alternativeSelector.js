const useSelectorWCustomEquality = (selector, isEqual) => {
  const ctx = React.useContext(StoreContext);
  const [_, setState] = React.useState({});
  const newVal = selector(ctx?.store?.getState());
  const oldVal = React.useRef(null);

  React.useLayoutEffect(() => {
    if (!ctx) return;
    const updaterCallback = () => {
      if (isEqual) {
        let activeState = selector(ctx.store.getState());
        if (isEqual(activeState, oldVal.current)) return;
        oldVal.current = activeState;
        setState({});
      } else {
        setState({});
      }
    };
    const unsubscribe = ctx.store.subscribe(() => updaterCallback());

    return () => {
      unsubscribe && unsubscribe();
    };
  }, []);

  if (!ctx) {
    return 0;
  }

  return newVal;
};
