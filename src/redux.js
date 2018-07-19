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
// убираем промоис и делаем через так называемый func -> вернем функцию, которая внутри себя принимает dispatch
// будет аналогичное поведение Promise -> если надо использовать async используют Thunk
function incrementAsync() {
    return (dispatch) => {
        setTimeout(() => {
            dispatch({type: 'INCREMENT'})
        }, 1000)
    }
}

//если action принимает промис, то не даем вернуть значение и вернем только когда промис зарезолвится
const promiseMiddleware = store => next => action => {
    //next -> это следующий middleware
    if ('then' in action) {
        // не даем action попасть в reducer, пока не зарезолвится
        // почему не next? посколько прирываем Middleware корректней прогнать next, так мы пропустили middleware
        //которые были до этого
        // store.dispatch - Вернуться в начало
        return action.then(store.dispatch)
    }

    return next(action);
};

// надо сохранить результат и вернуть его, так рекомендуется возвращать значение из middleware
const logger = store => next => action => {
    console.log('PREVIOUS STATE', store.getState());
    console.log('ACTION', action);
    const res = next(action);
    console.log('CURRENT STATE', store.getState());
    return res;
};


//добавляем функциональным подход
// thunk используется вместо асинхронности

const thunk = store => next => action => {
    if (typeof action === 'function') {
        return action(store.dispatch);
    }
    return next(action);
};


const store = createStore(reducer);
p = console.log;


//прокачиваем dispatch
// с каждым dispatchem меняем его , поэтому будем использовать middleware ->называть next -> вместо dispatcher
// store.dispatch = addLoger(store, store.dispatch);
// store.dispatch = addPromiseSupport(store, store.dispatch);
// store.dispatch = addThunkSupport(store, store.dispatch);

// как заменить?

function applyMiddleWare(store,...middlewares) {
    store.dispatch = middlewares.reduce((result, middleware) => {
        //result -> next
        return middleware(store)(result)
    },store.dispatch);
}

applyMiddleWare(store, logger, promiseMiddleware, thunk);

store.dispatch(incrementAsync());

