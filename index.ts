interface EProp {
    html: string
    value: string
}

interface Microformat {
    type: string[]
    value?: string
    properties: { [name: string]: Prop[] }
    children?: Microformat[]
}

interface Parsed {
    items: Microformat[]
    rels: Object
    'rel-urls': Object
}

interface Jf2 {
    type: string | string[]
    children?: Object[]
}

interface PropListMethods {
    value(): string
    html(): string
    prop(name: string): PropList
    children(): PropList
    toJf2(): Jf2
    byType(type: string): PropList
}

function isEProp(e: Prop): e is EProp {
    return (<EProp>e).html !== undefined
}

function isMicroformat(e: Prop): e is Microformat {
    return (<Microformat>e).type !== undefined
}

type Prop = string | EProp | Microformat

type PropList = PropWrapper[] & PropListMethods

function mixinConvenienceMethods(props: PropWrapper[]) {
    let pl = <PropList>props
    pl.value = () => pl[0].value()
    pl.html = () => pl[0].html()
    pl.prop = (p) => pl[0].prop(p)
    pl.children = () => pl[0].children()
    pl.toJf2 = () => pl[0].toJf2()
    pl.byType = (type) => {
        let items = pl.filter(i => i.type().some(t => t === type))
        return mixinConvenienceMethods(items)
    }
    return pl
}

class PropWrapper {
    _instance: Prop

    constructor(p: Prop) {
        this._instance = p
    }

    value() {
        if (isMicroformat(this._instance) || isEProp(this._instance)) {
        return this._instance.value
        } else {
            return this._instance
        }
    }

    html() {
        if (!isEProp(this._instance)) {
            throw new Error('not an eprop')
        }
        return this._instance.html
    }

    type() {
        if (!isMicroformat(this._instance)) {
            throw new Error('not a microformat')            
        }
        return this._instance.type
    }

    prop(name: string) {
        if (!isMicroformat(this._instance)) {
            throw new Error('not a microformat')
        }
        let props = (this._instance.properties[name] || [])
            .map(prop => new PropWrapper(prop))
        return mixinConvenienceMethods(props)
    }

    children() {
        if (!isMicroformat(this._instance)) {
            throw new Error('not a microformat')
        }
        let children = (this._instance.children || [])
            .map(child => new PropWrapper(child))
        return mixinConvenienceMethods(children)
    }

    toJf2(): Jf2 {
        if (!isMicroformat(this._instance)) {
            throw new Error('not a microformat')
        }
        let jf2: Jf2 = {
            type: null
        }
        for (let key in this._instance.properties) {
            let vals = this._instance.properties[key].map(val => 
                isMicroformat(val) ? new PropWrapper(val).toJf2() : val
            )
            jf2[key] = vals.length === 1 ? vals[0] : vals
        }
        if (this._instance.children) {
            jf2.children = this.children().map(child => child.toJf2())
        }
        jf2.type = this._instance.type.length === 1 ?
            this._instance.type[0] : this._instance.type
        return jf2
    }
}

export class Query {
    _instance: Parsed

    constructor(parsed: Parsed) {
        this._instance = parsed
    }

    items() {
        let items = this._instance.items
            .map(i => new PropWrapper(i))
        return mixinConvenienceMethods(items)
    }

    rels(name: string) {
        return this._instance.rels[name]
    }
}
