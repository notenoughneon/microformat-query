import * as assert from 'assert'
import {readFileSync} from 'fs'
import {Query} from '../index'

describe('Query', function() {
    var mq: Query

    before(function () {
        const mf = JSON.parse(readFileSync('test/entry.json', 'utf8'))
        mq = new Query(mf)
    })

    it('can read all items', function() {
        assert.deepEqual(
            mq.items().map(i => i.type()),
            [['h-entry'], ['h-card']]
        )
    })

    it('can filter by item type', function() {
        assert.deepEqual(
            mq.items().byType('h-card').map(i => i.type()),
            [['h-card']]
        )
    })

    it('can read first item by default', function() {
        assert.deepEqual(
            mq.items().type(),
            ['h-entry']
        )
    })

    it('can read string properties', function() {
        assert.deepEqual(
            mq.items().prop('name').value(),
            "I'm demoing skein at #indieweb summit 2016!"
        )
    })

    it('can read html of e-properties', function() {
        assert.deepEqual(
            mq.items().prop('content').html(),
            "<div class=\"note-content\">I'm demoing skein at #indieweb summit 2016!</div>"
        )
    })

    it('can convert items to jf2', function() {
        assert.deepEqual(
            mq.items().toJf2(),
            {
                "author": {
                    "name": "Emma Kuo",
                    "photo": "http://notenoughneon.com/m/emma-2016-128.jpg",
                    "type": "h-card",
                    "url": "http://notenoughneon.com"
                },
                "name": "I'm demoing skein at #indieweb summit 2016!",
                "published": "2016-06-04T18:31:19.303Z",
                "syndicate-to": "https://brid.gy/publish/twitter",
                "syndication": "https://twitter.com/notenoughneon/status/739162425602113536",
                "type": "h-entry",
                "url": "http://notenoughneon.com/2016/6/4/1",
                "content": {
                    "html": "<div class=\"note-content\">I'm demoing skein at #indieweb summit 2016!</div>",
                    "value": "I'm demoing skein at #indieweb summit 2016!"
                },
                "category": "indieweb",
                "children": [
                    {
                        "author": {
                            "type": "h-card",
                            "url": "https://bear.im/"
                        },
                        "content": {
                            "html": "this is a reply to Emma\n                          ",
                            "value": "this is a reply to Emma"
                        },
                        "name": "helping with a reply",
                        "published": "2016-06-04T18:32:40.000Z",
                        "type": "h-cite",
                        "url": "https://bear.im/bearlog/2016/156/helping-with-a-reply.html"
                    },
                    {
                        "author": {
                            "name": "Tantek Çelik",
                            "type": "h-card",
                            "url": "http://tantek.com/"
                        },
                        "like-of": "http://notenoughneon.com/2016/6/4/1",
                        "name": "Tantek Çelik liked this.",
                        "published": "2016-06-04T18:32:00.000Z",
                        "type": "h-cite",
                        "url": "http://tantek.com/2016/156/f1"
                    }
                ]
            }
        )
    })
})