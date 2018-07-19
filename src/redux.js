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

function incrementAsync() {
    return new Promise((resolve, reject) => {
        setTimeout(resolve({type: 'INCREMENT'}), 1000)
    })
}

//если action принимает промис, то не даем вернуть значение и вернем только когда промис зарезолвится
function addPromiseSupport(store, dispatch) {
    return (action) => {
        if ('then' in action) {
            // не даем action попасть в reducer, пока не зарезолвится
            return action.then(asyncSection => dispatch(asyncSection))
        }

        return dispatch(action);
    }
}


const store = createStore(reducer);
p = console.log;

const inc = {type: 'INCREMENT'};
const dec = {type: 'DECREMENT'};

//прокачиваем dispatch
store.dispatch = addPromiseSupport(store, store.dispatch);

store.dispatch(incrementAsync());

store.subscribe(() => {
    p(store.getState())
});