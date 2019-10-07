import React from 'react'
import { html } from '../components/Posts'

export default function (props) {
    return (
        <div style={{ margin: 30 }}>
            <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    )
}