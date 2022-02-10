const contextMapping = {
  'ip': '$ip',
  'page.url': '$current_url',
  'page.path': '$pathname',
  'os.name': '$os',
  'page.referrer': '$referrer',
  'screen.width': '$screen_width',
  'screen.height': '$screen_height',
  'device.type': '$device_type'
}

function parseContext(context) {
  if(!context) {
    return {}
  }
  let ret = {}
  if(context.campaign) {
    Object.entries(context.campaign).map(function([key, value]) {
      ret['utm_' + key] = value
    })
    delete context['campaign']
  }
  
  Object.entries(contextMapping).map(function([key, value]) {
    ret[value] = _.get(context, key)
  })
  
  // prepend all keys with segment_
  context = _.mapKeys(context, function(value, key) {
    return 'segment_' + key
  })
  return {...ret, ...context}
}
/**
 * @param {SpecTrack} event The track event
 * @param {Object.<string, any>} settings Custom settings
 * @return any
 */
async function onTrack(event, settings) {
    const baseUrl = settings.postHogInstance || 'https://app.posthog.com'
    const endpoint = new URL(`${baseUrl}/capture/`)
    endpoint.searchParams.set('ts', event.timestamp)

    if (event.properties && event.properties.url) {
        event.properties['$current_url'] = event.properties.url
        delete event.properties.url
    }
    
    if (event.properties && event.properties.utm_name) {
        event.properties["utm_campaign"] = event.properties.utm_name
    }

    const res = await fetch(endpoint, {
        body: JSON.stringify({
            ...event,
            api_key: settings.apiKey,
            properties: {
                ...parseContext(event.context),
                ...event.properties,
                ...(event.properties.browser ? { $browser: event.properties.browser } : {}),             
                distinct_id: event.userId || event.anonymousId,
                $lib: 'Segment'
            },
        }),
        headers: new Headers({
            'Content-Type': 'application/json',
        }),
        method: 'post',
    })

    return await res.json()
}

/**
 * @param {SpecIdentify} event The identify event
 * @param {Object.<string, any>} settings Custom settings
 * @return any
 */
async function onIdentify(event, settings) {
    if (!event.userId) {
        throw new InvalidEventPayload('userId is required when identifying')
    }
    let { properties } = event
    properties = properties || {}
    properties['$anon_distinct_id'] = event.anonymousId
    return await onTrack(
        {
            ...event,
            event: '$identify',
            properties,
            $set: event.traits,
        },
        settings
    )
}

/**
 * @param {SpecGroup} event The group event
 * @param {Object.<string, any>} settings Custom settings
 * @return any
 */
async function onGroup(event, settings) {
    throw new EventNotSupported('on groups is not supported')
}

/**
 * @param {SpecPage} event The page event
 * @param {Object.<string, any>} settings Custom settings
 * @return any
 */
async function onPage(event, settings) {
    return await onTrack(
        {
            event: '$pageview',
            ...event,
        },
        settings
    )
}

/**
 * @param {SpecAlias} event The alias event
 * @param {Object.<string, any>} settings Custom settings
 * @return any
 */
async function onAlias(event, settings) {
    return await onTrack(
        {
            ...event,
            event: '$create_alias',
            properties: {
                alias: event.previousId,
                distinct_id: event.userId,
            },
        },
        settings
    )
}

/**
 * @param {SpecScreen} event The screen event
 * @param {Object.<string, any>} settings Custom settings
 * @return any
 */
async function onScreen(event, settings) {
    return await onTrack(
        {
            ...event,
            event: '$screen',
            properties: {
                ...event.properties,
                $screen_name: event.name,
            },
        },
        settings
    )
}

