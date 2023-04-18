const mocks = {
    alias: require('./test/data-alias.json'),
    group: require('./test/data-group.json'),
    identify: require('./test/data-identify.json'),
    page: require('./test/data-page.json'),
    screen: require('./test/data-screen.json'),
    track: require('./test/data-track.json'),
}

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ success: true }),
    })
)

global._ = require('lodash')

// See prepare-test.sh for why we use module.js instead of index.js
const integration = require('./module.js')

const settings = { postHogInstance: 'https://eu.posthog.com', apiKey: 'test-key' }

describe('Segment Integration', () => {
    beforeEach(() => {
        global.fetch.mockClear()
    })

    describe('onTrack', () => {
        it('should send to PostHog', async () => {
            await integration.onTrack(mocks.track, settings)

            expect(global.fetch).toHaveBeenCalledTimes(1)
            const lastFetchCall = global.fetch.mock.calls[0]

            expect(lastFetchCall[0].toString()).toEqual(
                'https://eu.posthog.com/capture/?ts=2015-12-12T19%3A11%3A01.249Z'
            )

            expect(JSON.parse(lastFetchCall[1].body)).toEqual({
                api_key: 'test-key',
                event: 'Course Clicked',
                properties: {
                    $current_url: 'https://segment.com/academy/',
                    $groups: {
                        segment_group: 'GroupId1',
                    },
                    $ip: '108.0.78.21',
                    $lib: 'Segment',
                    $pathname: '/academy/',
                    $referrer: '',
                    distinct_id: 'AiUGstSDIg',
                    segment_ip: '108.0.78.21',
                    segment_library: {
                        name: 'analytics.js',
                        version: '2.11.1',
                    },
                    segment_page: {
                        path: '/academy/',
                        referrer: '',
                        search: '',
                        title: 'Analytics Academy',
                        url: 'https://segment.com/academy/',
                    },
                    segment_userAgent:
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36',
                    title: 'Intro to Analytics',
                    utm_campaign: 'utm_name',
                    utm_name: 'utm_name',
                    segment_groupId: 'GroupId1',
                },
                timestamp: '2015-12-12T19:11:01.249Z',
            })
        })
    })

    describe('onIdentify', () => {
        it('should send to PostHog', async () => {
            await integration.onIdentify(mocks.identify, settings)

            expect(global.fetch).toHaveBeenCalledTimes(1)
            const lastFetchCall = global.fetch.mock.calls[0]

            expect(lastFetchCall[0].toString()).toEqual(
                'https://eu.posthog.com/capture/?ts=2015-02-23T22%3A28%3A55.111Z'
            )

            expect(JSON.parse(lastFetchCall[1].body)).toEqual({
                timestamp: '2015-02-23T22:28:55.111Z',
                event: '$identify',
                api_key: 'test-key',
                properties: {
                    $ip: '8.8.8.8',
                    segment_ip: '8.8.8.8',
                    segment_userAgent:
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36',
                    $anon_distinct_id: '507f191e810c19729de860ea',
                    distinct_id: '97980cfea0067',
                    $lib: 'Segment',
                    $set: {
                        address: {
                            city: 'San Francisco',
                            country: 'USA',
                            postalCode: '94103',
                            state: 'CA',
                            street: '6th St',
                        },
                        email: 'peter@example.com',
                        logins: 5,
                        name: 'Peter Gibbons',
                        plan: 'premium',
                    },
                },
            })
        })

        it('should call $set if there is no userId', async () => {
            const mockIdentify = { ...mocks.identify }
            mockIdentify.userId = undefined

            await integration.onIdentify(mockIdentify, settings)

            const lastFetchCall = global.fetch.mock.calls[0]

            expect(JSON.parse(lastFetchCall[1].body)).toEqual({
                timestamp: '2015-02-23T22:28:55.111Z',
                event: '$set',
                api_key: 'test-key',
                properties: {
                    $ip: '8.8.8.8',
                    segment_ip: '8.8.8.8',
                    segment_userAgent:
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36',
                    distinct_id: '507f191e810c19729de860ea',
                    $lib: 'Segment',
                    $set: {
                        address: {
                            city: 'San Francisco',
                            country: 'USA',
                            postalCode: '94103',
                            state: 'CA',
                            street: '6th St',
                        },
                        email: 'peter@example.com',
                        logins: 5,
                        name: 'Peter Gibbons',
                        plan: 'premium',
                    },
                },
            })
        })
    })

    describe('onGroup', () => {
        it('should send to PostHog', async () => {
            await integration.onGroup(mocks.group, settings)

            expect(global.fetch).toHaveBeenCalledTimes(1)
            const lastFetchCall = global.fetch.mock.calls[0]

            expect(lastFetchCall[0].toString()).toEqual(
                'https://eu.posthog.com/capture/?ts=2015-02-23T22%3A28%3A55.111Z'
            )

            expect(JSON.parse(lastFetchCall[1].body)).toEqual({
                timestamp: '2015-02-23T22:28:55.111Z',
                event: '$groupidentify',
                api_key: 'test-key',
                properties: {
                    $ip: '8.8.8.8',
                    segment_ip: '8.8.8.8',
                    segment_userAgent:
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36',
                    $group_type: 'segment_group',
                    $group_key: '0e8c78ea9d97a7b8185e8632',
                    $group_set: {
                        name: 'Initech',
                        industry: 'Technology',
                        employees: 329,
                        plan: 'enterprise',
                        'total billed': 830,
                    },
                    distinct_id: '97980cfea0067',
                    $lib: 'Segment',
                },
            })
        })
    })

    describe('onPage', () => {
        it('should send to PostHog', async () => {
            await integration.onPage(mocks.page, settings)

            expect(global.fetch).toHaveBeenCalledTimes(1)
            const lastFetchCall = global.fetch.mock.calls[0]

            expect(lastFetchCall[0].toString()).toEqual(
                'https://eu.posthog.com/capture/?ts=2015-02-23T22%3A28%3A55.111Z'
            )

            expect(JSON.parse(lastFetchCall[1].body)).toEqual({
                timestamp: '2015-02-23T22:28:55.111Z',
                event: '$pageview',
                api_key: 'test-key',
                properties: {
                    $ip: '8.8.8.8',
                    $current_url: 'http://www.example.com',
                    segment_ip: '8.8.8.8',
                    segment_userAgent:
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36',
                    title: 'Welcome | Initech',
                    distinct_id: '97980cfea0067',
                    $lib: 'Segment',
                },
            })
        })
    })

    describe('onScreen', () => {
        it('should send to PostHog', async () => {
            await integration.onScreen(mocks.screen, settings)

            expect(global.fetch).toHaveBeenCalledTimes(1)
            const lastFetchCall = global.fetch.mock.calls[0]

            expect(lastFetchCall[0].toString()).toEqual(
                'https://eu.posthog.com/capture/?ts=2015-02-23T22%3A28%3A55.111Z'
            )

            expect(JSON.parse(lastFetchCall[1].body)).toEqual({
                timestamp: '2015-02-23T22:28:55.111Z',
                event: '$screen',
                api_key: 'test-key',
                properties: {
                    $ip: '8.8.8.8',
                    segment_ip: '8.8.8.8',
                    variation: 'blue signup button',
                    $screen_name: 'Home',
                    distinct_id: '97980cfea0067',
                    $lib: 'Segment',
                },
            })
        })
    })

    describe('onAlias', () => {
        it('should send to PostHog', async () => {
            await integration.onAlias(mocks.alias, settings)

            expect(global.fetch).toHaveBeenCalledTimes(1)
            const lastFetchCall = global.fetch.mock.calls[0]

            expect(lastFetchCall[0].toString()).toEqual(
                'https://eu.posthog.com/capture/?ts=2015-02-23T22%3A28%3A55.111Z'
            )

            expect(JSON.parse(lastFetchCall[1].body)).toEqual({
                timestamp: '2015-02-23T22:28:55.111Z',
                event: '$create_alias',
                api_key: 'test-key',
                properties: {
                    $ip: '8.8.8.8',
                    segment_ip: '8.8.8.8',
                    segment_userAgent:
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36',
                    alias: '39239-239239-239239-23923',
                    distinct_id: '507f191e81',
                    $lib: 'Segment',
                },
            })
        })
    })
})
