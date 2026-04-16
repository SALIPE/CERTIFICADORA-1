
export const baseURL = process.env.REACT_APP_API_BASE_URL;


function internalGet(url, headers) {
    const requestOptions = {
        method: 'GET',
        headers
    };
    return fetch(getUrl(url), requestOptions)
}

function internalPost(url, body, isJson, headers) {
    var requestOptions = {
        method: 'POST',
        headers: headers
    };
    if (body) {
        requestOptions.body = isJson ? JSON.stringify(body) : body;
    }
    return fetch(getUrl(url), requestOptions)
}

export async function get(url) {
    return internalGet(url, getHeaders(url))
        .then(handleJsonResponse)
}

export async function post(url, body) {
    return internalPost(url, body, true, getHeaders(url))
        .then(handleJsonResponse)
}

export async function postNoResponse(url, body) {
    return internalPost(url, body, true, getHeaders(url))
        .then(async response => {
            // isAuthenticate(response)
            if (!response.ok) {
                const { error } = await response.json()
                console.error(error)
                throw Error(error.name);
            }
            return response
        })
}


async function handleJsonResponse(response) {
    // isAuthenticate(response)
    if (!response.ok) {
        const error = await response.json()
        console.error(error)
        throw Error(error.message);
    }
    return await response.json();
}


function getUrl(url) {
    if (url.includes('http')) {
        return url;
    } else {
        return baseURL + url;
    }
}

export function getHeaders(url) {
    return {
        'Content-Type': 'application/json',
        'Authorization': sessionStorage.getItem('user'),
    };
}

function isAuthenticate(response) {
    if (response.status === 401 || response.status === 403) {
        cleanStorage();
        window.location.assign("/");
    }
}


export function cleanStorage() {
    sessionStorage.removeItem('user');
}

