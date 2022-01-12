import React from 'react';

const shareEndpoint = "php/share";

export default async function fetchLanisShare(body, dev=false) {
    const endpoint = dev ? "http://www.lanis.co.uk/" + shareEndpoint : shareEndpoint;
    return await fetch(endpoint, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });
}