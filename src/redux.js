function createStore(reducer) {
    let state = reducer(undefined, {type: 'INIT'});
    let subscribers = [];

    return {
        getState() {
            return state;
        },
        subscribe(subscriber) {
            subscribers = subscribers.concat(subscriber);

            return () => {
                subscribers = subscribers.filter(sbscrb => subscriber !== sbscrb);
            }
        },
        dispatch(action) {
            state = reducer(state, action);
            subscribers.forEach(subscriber => subscriber());
        },
    }

}


const reducer = (state = 0, action) => {
    if (action.type === 'INCREMENT') {
        return state + 1;
    } else if (action.type === 'DECREMENT') {
        return state - 1;
    }
};


const store = createStore(reducer);
p = console.log;

const  inc = {type:'INCREMENT'};
const dec = {type:'DECREMENT'};

store.dispatch(inc);
store.dispatch(inc);
store.dispatch(inc);
store.dispatch(dec);


p(store.getState()); //output 2