import React from 'react';

// const ormEndpoint = "http://www.lanis.co.uk/php/lapi";
const ormEndpoint = "php/lapi";

export default async function fetchLanis(body, dev=false) {
    const endpoint = dev ? "http://www.lanis.co.uk/" + ormEndpoint : ormEndpoint;
    return await fetch(endpoint, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });
}