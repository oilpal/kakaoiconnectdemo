var ConnectLive = function() {
    "use strict";
    /*! *****************************************************************************
        Copyright (c) Microsoft Corporation.

        Permission to use, copy, modify, and/or distribute this software for any
        purpose with or without fee is hereby granted.

        THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
        REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
        AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
        INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
        LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
        OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
        PERFORMANCE OF THIS SOFTWARE.
        ***************************************************************************** */
    function e(e, t, i, r) {
        var o, n = arguments.length,
            s = n < 3 ? t : null === r ? r = Object.getOwnPropertyDescriptor(t, i) : r;
        if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) s = Reflect.decorate(e, t, i, r);
        else
            for (var a = e.length - 1; a >= 0; a--)(o = e[a]) && (s = (n < 3 ? o(s) : n > 3 ? o(t, i, s) : o(t, i)) || s);
        return n > 3 && s && Object.defineProperty(t, i, s), s
    }

    function t(e, t, i, r) {
        return new(i || (i = Promise))((function(o, n) {
            function s(e) {
                try {
                    d(r.next(e))
                } catch (e) {
                    n(e)
                }
            }

            function a(e) {
                try {
                    d(r.throw(e))
                } catch (e) {
                    n(e)
                }
            }

            function d(e) {
                var t;
                e.done ? o(e.value) : (t = e.value, t instanceof i ? t : new i((function(e) {
                    e(t)
                }))).then(s, a)
            }
            d((r = r.apply(e, t || [])).next())
        }))
    }
    const i = "2.2.3",
        r = e => t(void 0, void 0, void 0, (function*() {
            const t = (new TextEncoder).encode(e),
                i = yield crypto.subtle.digest("SHA-256", t);
            return [...new Uint8Array(i)].map((e => e.toString(16).padStart(2, "0"))).join("")
        })),
        o = Object.prototype.hasOwnProperty,
        n = "function" == typeof Number.isSafeInteger ? Number.isSafeInteger : function(e) {
            return "number" == typeof e && isFinite(e) && e === Math.floor(e) && Math.abs(e) <= 9007199254740991
        };
    class s {
        constructor() {
            this.jsonrpc = "2.0"
        }
        serialize() {
            return JSON.stringify(this)
        }
    }
    s.VERSION = "2.0";
    class a extends s {
        constructor(e, t, i) {
            super(), this.id = e, this.method = t, void 0 !== i && (this.params = i)
        }
    }
    class d extends s {
        constructor(e, t) {
            super(), this.method = e, void 0 !== t && (this.params = t)
        }
    }
    class c extends s {
        constructor(e, t) {
            super(), this.id = e, this.result = t
        }
    }
    class l extends s {
        constructor(e, t) {
            super(), this.id = e, this.error = t, this.id = e, this.error = t
        }
    }
    class u {
        constructor(e, t) {
            this.payload = e, this.type = t, this.payload = e, this.type = t
        }
    }
    class h {
        constructor(e, t, i) {
            this.message = e, this.code = n(t) ? t : 0, null != i && (this.data = i)
        }
    }

    function p(e, t, i) {
        const r = new a(e, t, i);
        return f(r, !0), r
    }

    function m(e) {
        if (!w(e)) return new u(h.invalidRequest(e), "invalid");
        let t;
        try {
            t = JSON.parse(e)
        } catch (t) {
            return new u(h.parseError(e), "invalid")
        }
        return function(e) {
            if (!Array.isArray(e)) return v(e);
            if (0 === e.length) return new u(h.invalidRequest(e), "invalid");
            const t = [];
            for (let i = 0, r = e.length; i < r; i++) t[i] = v(e[i]);
            return t
        }(t)
    }

    function v(e) {
        let t = null,
            i = null,
            r = "invalid";
        if (null == e || e.jsonrpc !== s.VERSION) t = h.invalidRequest(e), r = "invalid";
        else if (o.call(e, "id")) {
            if (o.call(e, "method")) {
                const o = e;
                i = new a(o.id, o.method, o.params), t = f(i), r = "request"
            } else if (o.call(e, "result")) {
                const o = e;
                i = new c(o.id, o.result), t = f(i), r = "success"
            } else if (o.call(e, "error")) {
                const o = e;
                if (r = "error", null == o.error) t = h.internalError(o);
                else {
                    const e = new h(o.error.message, o.error.code, o.error.data);
                    e.message !== o.error.message || e.code !== o.error.code ? t = h.internalError(o) : (i = new l(o.id, e), t = f(i))
                }
            }
        } else {
            const o = e;
            i = new d(o.method, o.params), t = f(i), r = "notification"
        }
        return null == t && null != i ? new u(i, r) : new u(null != t ? t : h.invalidRequest(e), "invalid")
    }

    function f(e, t) {
        let i = null;
        if (e instanceof a ? (i = g(e.id), null == i && (i = b(e.method)), null == i && (i = y(e.params))) : e instanceof d ? (i = b(e.method), null == i && (i = y(e.params))) : e instanceof c ? (i = g(e.id), null == i && (i = void 0 === e.result ? h.internalError("Result must exist for success Response objects") : null)) : e instanceof l && (i = g(e.id, !0), null == i && (i = function(e) {
            if (!(e instanceof h)) return h.internalError("Error must be an instance of JsonRpcError");
            if (!n(e.code)) return h.internalError("Invalid error code. It must be an integer.");
            if (!w(e.message)) return h.internalError("Message must exist or must be a string.");
            return null
        }(e.error))), t && null != i) throw i;
        return i
    }

    function g(e, t) {
        return t && null === e || w(e) || n(e) ? null : h.internalError('"id" must be provided, a string or an integer.')
    }

    function b(e) {
        return w(e) ? null : h.invalidRequest(e)
    }

    function y(e) {
        if (void 0 === e) return null;
        if (Array.isArray(e) || null != (t = e) && "object" == typeof t && !Array.isArray(t)) try {
            return JSON.stringify(e), null
        } catch (t) {
            return h.parseError(e)
        }
        var t;
        return h.invalidParams(e)
    }

    function w(e) {
        return "" !== e && "string" == typeof e
    }
    h.invalidRequest = function(e) {
        return new h("Invalid request", -32600, e)
    }, h.methodNotFound = function(e) {
        return new h("Method not found", -32601, e)
    }, h.invalidParams = function(e) {
        return new h("Invalid params", -32602, e)
    }, h.internalError = function(e) {
        return new h("Internal error", -32603, e)
    }, h.parseError = function(e) {
        return new h("Parse error", -32700, e)
    };
    const S = new class {
        constructor() {
            this.id = 0
        }
        get() {
            return this.id += 1, this.id
        }
        reset() {
            this.id = 0
        }
    };
    var I, R, k = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {},
        E = {
            exports: {}
        };
    I = E, R = E.exports,
        function(e, t) {
            var i = "function",
                r = "undefined",
                o = "object",
                n = "string",
                s = "model",
                a = "name",
                d = "type",
                c = "vendor",
                l = "version",
                u = "architecture",
                h = "console",
                p = "mobile",
                m = "tablet",
                v = "smarttv",
                f = "wearable",
                g = "embedded",
                b = "Amazon",
                y = "Apple",
                w = "ASUS",
                S = "BlackBerry",
                k = "Firefox",
                E = "Google",
                _ = "Huawei",
                C = "LG",
                M = "Microsoft",
                A = "Motorola",
                T = "Opera",
                O = "Samsung",
                P = "Sony",
                x = "Xiaomi",
                D = "Zebra",
                L = "Facebook",
                V = function(e) {
                    for (var t = {}, i = 0; i < e.length; i++) t[e[i].toUpperCase()] = e[i];
                    return t
                },
                N = function(e, t) {
                    return typeof e === n && -1 !== U(t).indexOf(U(e))
                },
                U = function(e) {
                    return e.toLowerCase()
                },
                j = function(e, t) {
                    if (typeof e === n) return e = e.replace(/^\s\s*/, "").replace(/\s\s*$/, ""), typeof t === r ? e : e.substring(0, 255)
                },
                $ = function(e, r) {
                    for (var n, s, a, d, c, l, u = 0; u < r.length && !c;) {
                        var h = r[u],
                            p = r[u + 1];
                        for (n = s = 0; n < h.length && !c;)
                            if (c = h[n++].exec(e))
                                for (a = 0; a < p.length; a++) l = c[++s], typeof(d = p[a]) === o && d.length > 0 ? 2 === d.length ? typeof d[1] == i ? this[d[0]] = d[1].call(this, l) : this[d[0]] = d[1] : 3 === d.length ? typeof d[1] !== i || d[1].exec && d[1].test ? this[d[0]] = l ? l.replace(d[1], d[2]) : t : this[d[0]] = l ? d[1].call(this, l, d[2]) : t : 4 === d.length && (this[d[0]] = l ? d[3].call(this, l.replace(d[1], d[2])) : t) : this[d] = l || t;
                        u += 2
                    }
                },
                F = function(e, i) {
                    for (var r in i)
                        if (typeof i[r] === o && i[r].length > 0) {
                            for (var n = 0; n < i[r].length; n++)
                                if (N(i[r][n], e)) return "?" === r ? t : r
                        } else if (N(i[r], e)) return "?" === r ? t : r;
                    return e
                },
                B = {
                    ME: "4.90",
                    "NT 3.11": "NT3.51",
                    "NT 4.0": "NT4.0",
                    2e3: "NT 5.0",
                    XP: ["NT 5.1", "NT 5.2"],
                    Vista: "NT 6.0",
                    7: "NT 6.1",
                    8: "NT 6.2",
                    8.1: "NT 6.3",
                    10: ["NT 6.4", "NT 10.0"],
                    RT: "ARM"
                },
                q = {
                    browser: [
                        [/\b(?:crmo|crios)\/([\w\.]+)/i],
                        [l, [a, "Chrome"]],
                        [/edg(?:e|ios|a)?\/([\w\.]+)/i],
                        [l, [a, "Edge"]],
                        [/(opera mini)\/([-\w\.]+)/i, /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i, /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i],
                        [a, l],
                        [/opios[\/ ]+([\w\.]+)/i],
                        [l, [a, "Opera Mini"]],
                        [/\bopr\/([\w\.]+)/i],
                        [l, [a, T]],
                        [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i, /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i, /(ba?idubrowser)[\/ ]?([\w\.]+)/i, /(?:ms|\()(ie) ([\w\.]+)/i, /(flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale|qqbrowserlite|qq)\/([-\w\.]+)/i, /(weibo)__([\d\.]+)/i],
                        [a, l],
                        [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i],
                        [l, [a, "UCBrowser"]],
                        [/\bqbcore\/([\w\.]+)/i],
                        [l, [a, "WeChat(Win) Desktop"]],
                        [/micromessenger\/([\w\.]+)/i],
                        [l, [a, "WeChat"]],
                        [/konqueror\/([\w\.]+)/i],
                        [l, [a, "Konqueror"]],
                        [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i],
                        [l, [a, "IE"]],
                        [/yabrowser\/([\w\.]+)/i],
                        [l, [a, "Yandex"]],
                        [/(avast|avg)\/([\w\.]+)/i],
                        [
                            [a, /(.+)/, "$1 Secure Browser"], l
                        ],
                        [/\bfocus\/([\w\.]+)/i],
                        [l, [a, "Firefox Focus"]],
                        [/\bopt\/([\w\.]+)/i],
                        [l, [a, "Opera Touch"]],
                        [/coc_coc\w+\/([\w\.]+)/i],
                        [l, [a, "Coc Coc"]],
                        [/dolfin\/([\w\.]+)/i],
                        [l, [a, "Dolphin"]],
                        [/coast\/([\w\.]+)/i],
                        [l, [a, "Opera Coast"]],
                        [/miuibrowser\/([\w\.]+)/i],
                        [l, [a, "MIUI Browser"]],
                        [/fxios\/([-\w\.]+)/i],
                        [l, [a, k]],
                        [/\bqihu|(qi?ho?o?|360)browser/i],
                        [
                            [a, "360 Browser"]
                        ],
                        [/(oculus|samsung|sailfish)browser\/([\w\.]+)/i],
                        [
                            [a, /(.+)/, "$1 Browser"], l
                        ],
                        [/(comodo_dragon)\/([\w\.]+)/i],
                        [
                            [a, /_/g, " "], l
                        ],
                        [/(electron)\/([\w\.]+) safari/i, /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i, /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i],
                        [a, l],
                        [/(metasr)[\/ ]?([\w\.]+)/i, /(lbbrowser)/i],
                        [a],
                        [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i],
                        [
                            [a, L], l
                        ],
                        [/safari (line)\/([\w\.]+)/i, /\b(line)\/([\w\.]+)\/iab/i, /(chromium|instagram)[\/ ]([-\w\.]+)/i],
                        [a, l],
                        [/\bgsa\/([\w\.]+) .*safari\//i],
                        [l, [a, "GSA"]],
                        [/headlesschrome(?:\/([\w\.]+)| )/i],
                        [l, [a, "Chrome Headless"]],
                        [/ wv\).+(chrome)\/([\w\.]+)/i],
                        [
                            [a, "Chrome WebView"], l
                        ],
                        [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i],
                        [l, [a, "Android Browser"]],
                        [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i],
                        [a, l],
                        [/version\/([\w\.]+) .*mobile\/\w+ (safari)/i],
                        [l, [a, "Mobile Safari"]],
                        [/version\/([\w\.]+) .*(mobile ?safari|safari)/i],
                        [l, a],
                        [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i],
                        [a, [l, F, {
                            "1.0": "/8",
                            1.2: "/1",
                            1.3: "/3",
                            "2.0": "/412",
                            "2.0.2": "/416",
                            "2.0.3": "/417",
                            "2.0.4": "/419",
                            "?": "/"
                        }]],
                        [/(webkit|khtml)\/([\w\.]+)/i],
                        [a, l],
                        [/(navigator|netscape\d?)\/([-\w\.]+)/i],
                        [
                            [a, "Netscape"], l
                        ],
                        [/mobile vr; rv:([\w\.]+)\).+firefox/i],
                        [l, [a, "Firefox Reality"]],
                        [/ekiohf.+(flow)\/([\w\.]+)/i, /(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i, /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i, /(firefox)\/([\w\.]+)/i, /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i, /(links) \(([\w\.]+)/i],
                        [a, l]
                    ],
                    cpu: [
                        [/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i],
                        [
                            [u, "amd64"]
                        ],
                        [/(ia32(?=;))/i],
                        [
                            [u, U]
                        ],
                        [/((?:i[346]|x)86)[;\)]/i],
                        [
                            [u, "ia32"]
                        ],
                        [/\b(aarch64|arm(v?8e?l?|_?64))\b/i],
                        [
                            [u, "arm64"]
                        ],
                        [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i],
                        [
                            [u, "armhf"]
                        ],
                        [/windows (ce|mobile); ppc;/i],
                        [
                            [u, "arm"]
                        ],
                        [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i],
                        [
                            [u, /ower/, "", U]
                        ],
                        [/(sun4\w)[;\)]/i],
                        [
                            [u, "sparc"]
                        ],
                        [/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i],
                        [
                            [u, U]
                        ]
                    ],
                    device: [
                        [/\b(sch-i[89]0\d|shw-m380s|sm-[pt]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i],
                        [s, [c, O],
                            [d, m]
                        ],
                        [/\b((?:s[cgp]h|gt|sm)-\w+|galaxy nexus)/i, /samsung[- ]([-\w]+)/i, /sec-(sgh\w+)/i],
                        [s, [c, O],
                            [d, p]
                        ],
                        [/\((ip(?:hone|od)[\w ]*);/i],
                        [s, [c, y],
                            [d, p]
                        ],
                        [/\((ipad);[-\w\),; ]+apple/i, /applecoremedia\/[\w\.]+ \((ipad)/i, /\b(ipad)\d\d?,\d\d?[;\]].+ios/i],
                        [s, [c, y],
                            [d, m]
                        ],
                        [/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i],
                        [s, [c, _],
                            [d, m]
                        ],
                        [/(?:huawei|honor)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}-[atu]?[ln][01259x][012359][an]?)\b(?!.+d\/s)/i],
                        [s, [c, _],
                            [d, p]
                        ],
                        [/\b(poco[\w ]+)(?: bui|\))/i, /\b; (\w+) build\/hm\1/i, /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i, /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i, /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i],
                        [
                            [s, /_/g, " "],
                            [c, x],
                            [d, p]
                        ],
                        [/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i],
                        [
                            [s, /_/g, " "],
                            [c, x],
                            [d, m]
                        ],
                        [/; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i],
                        [s, [c, "OPPO"],
                            [d, p]
                        ],
                        [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i],
                        [s, [c, "Vivo"],
                            [d, p]
                        ],
                        [/\b(rmx[12]\d{3})(?: bui|;|\))/i],
                        [s, [c, "Realme"],
                            [d, p]
                        ],
                        [/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i, /\bmot(?:orola)?[- ](\w*)/i, /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i],
                        [s, [c, A],
                            [d, p]
                        ],
                        [/\b(mz60\d|xoom[2 ]{0,2}) build\//i],
                        [s, [c, A],
                            [d, m]
                        ],
                        [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i],
                        [s, [c, C],
                            [d, m]
                        ],
                        [/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i, /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i, /\blg-?([\d\w]+) bui/i],
                        [s, [c, C],
                            [d, p]
                        ],
                        [/(ideatab[-\w ]+)/i, /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i],
                        [s, [c, "Lenovo"],
                            [d, m]
                        ],
                        [/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i],
                        [
                            [s, /_/g, " "],
                            [c, "Nokia"],
                            [d, p]
                        ],
                        [/(pixel c)\b/i],
                        [s, [c, E],
                            [d, m]
                        ],
                        [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i],
                        [s, [c, E],
                            [d, p]
                        ],
                        [/droid.+ ([c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i],
                        [s, [c, P],
                            [d, p]
                        ],
                        [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i],
                        [
                            [s, "Xperia Tablet"],
                            [c, P],
                            [d, m]
                        ],
                        [/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i],
                        [s, [c, "OnePlus"],
                            [d, p]
                        ],
                        [/(alexa)webm/i, /(kf[a-z]{2}wi)( bui|\))/i, /(kf[a-z]+)( bui|\)).+silk\//i],
                        [s, [c, b],
                            [d, m]
                        ],
                        [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i],
                        [
                            [s, /(.+)/g, "Fire Phone $1"],
                            [c, b],
                            [d, p]
                        ],
                        [/(playbook);[-\w\),; ]+(rim)/i],
                        [s, c, [d, m]],
                        [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i],
                        [s, [c, S],
                            [d, p]
                        ],
                        [/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i],
                        [s, [c, w],
                            [d, m]
                        ],
                        [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i],
                        [s, [c, w],
                            [d, p]
                        ],
                        [/(nexus 9)/i],
                        [s, [c, "HTC"],
                            [d, m]
                        ],
                        [/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i, /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i, /(alcatel|geeksphone|nexian|panasonic|sony)[-_ ]?([-\w]*)/i],
                        [c, [s, /_/g, " "],
                            [d, p]
                        ],
                        [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i],
                        [s, [c, "Acer"],
                            [d, m]
                        ],
                        [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i],
                        [s, [c, "Meizu"],
                            [d, p]
                        ],
                        [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i],
                        [s, [c, "Sharp"],
                            [d, p]
                        ],
                        [/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i, /(hp) ([\w ]+\w)/i, /(asus)-?(\w+)/i, /(microsoft); (lumia[\w ]+)/i, /(lenovo)[-_ ]?([-\w]+)/i, /(jolla)/i, /(oppo) ?([\w ]+) bui/i],
                        [c, s, [d, p]],
                        [/(archos) (gamepad2?)/i, /(hp).+(touchpad(?!.+tablet)|tablet)/i, /(kindle)\/([\w\.]+)/i, /(nook)[\w ]+build\/(\w+)/i, /(dell) (strea[kpr\d ]*[\dko])/i, /(le[- ]+pan)[- ]+(\w{1,9}) bui/i, /(trinity)[- ]*(t\d{3}) bui/i, /(gigaset)[- ]+(q\w{1,9}) bui/i, /(vodafone) ([\w ]+)(?:\)| bui)/i],
                        [c, s, [d, m]],
                        [/(surface duo)/i],
                        [s, [c, M],
                            [d, m]
                        ],
                        [/droid [\d\.]+; (fp\du?)(?: b|\))/i],
                        [s, [c, "Fairphone"],
                            [d, p]
                        ],
                        [/(u304aa)/i],
                        [s, [c, "AT&T"],
                            [d, p]
                        ],
                        [/\bsie-(\w*)/i],
                        [s, [c, "Siemens"],
                            [d, p]
                        ],
                        [/\b(rct\w+) b/i],
                        [s, [c, "RCA"],
                            [d, m]
                        ],
                        [/\b(venue[\d ]{2,7}) b/i],
                        [s, [c, "Dell"],
                            [d, m]
                        ],
                        [/\b(q(?:mv|ta)\w+) b/i],
                        [s, [c, "Verizon"],
                            [d, m]
                        ],
                        [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i],
                        [s, [c, "Barnes & Noble"],
                            [d, m]
                        ],
                        [/\b(tm\d{3}\w+) b/i],
                        [s, [c, "NuVision"],
                            [d, m]
                        ],
                        [/\b(k88) b/i],
                        [s, [c, "ZTE"],
                            [d, m]
                        ],
                        [/\b(nx\d{3}j) b/i],
                        [s, [c, "ZTE"],
                            [d, p]
                        ],
                        [/\b(gen\d{3}) b.+49h/i],
                        [s, [c, "Swiss"],
                            [d, p]
                        ],
                        [/\b(zur\d{3}) b/i],
                        [s, [c, "Swiss"],
                            [d, m]
                        ],
                        [/\b((zeki)?tb.*\b) b/i],
                        [s, [c, "Zeki"],
                            [d, m]
                        ],
                        [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i],
                        [
                            [c, "Dragon Touch"], s, [d, m]
                        ],
                        [/\b(ns-?\w{0,9}) b/i],
                        [s, [c, "Insignia"],
                            [d, m]
                        ],
                        [/\b((nxa|next)-?\w{0,9}) b/i],
                        [s, [c, "NextBook"],
                            [d, m]
                        ],
                        [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i],
                        [
                            [c, "Voice"], s, [d, p]
                        ],
                        [/\b(lvtel\-)?(v1[12]) b/i],
                        [
                            [c, "LvTel"], s, [d, p]
                        ],
                        [/\b(ph-1) /i],
                        [s, [c, "Essential"],
                            [d, p]
                        ],
                        [/\b(v(100md|700na|7011|917g).*\b) b/i],
                        [s, [c, "Envizen"],
                            [d, m]
                        ],
                        [/\b(trio[-\w\. ]+) b/i],
                        [s, [c, "MachSpeed"],
                            [d, m]
                        ],
                        [/\btu_(1491) b/i],
                        [s, [c, "Rotor"],
                            [d, m]
                        ],
                        [/(shield[\w ]+) b/i],
                        [s, [c, "Nvidia"],
                            [d, m]
                        ],
                        [/(sprint) (\w+)/i],
                        [c, s, [d, p]],
                        [/(kin\.[onetw]{3})/i],
                        [
                            [s, /\./g, " "],
                            [c, M],
                            [d, p]
                        ],
                        [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i],
                        [s, [c, D],
                            [d, m]
                        ],
                        [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i],
                        [s, [c, D],
                            [d, p]
                        ],
                        [/(ouya)/i, /(nintendo) ([wids3utch]+)/i],
                        [c, s, [d, h]],
                        [/droid.+; (shield) bui/i],
                        [s, [c, "Nvidia"],
                            [d, h]
                        ],
                        [/(playstation [345portablevi]+)/i],
                        [s, [c, P],
                            [d, h]
                        ],
                        [/\b(xbox(?: one)?(?!; xbox))[\); ]/i],
                        [s, [c, M],
                            [d, h]
                        ],
                        [/smart-tv.+(samsung)/i],
                        [c, [d, v]],
                        [/hbbtv.+maple;(\d+)/i],
                        [
                            [s, /^/, "SmartTV"],
                            [c, O],
                            [d, v]
                        ],
                        [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i],
                        [
                            [c, C],
                            [d, v]
                        ],
                        [/(apple) ?tv/i],
                        [c, [s, "Apple TV"],
                            [d, v]
                        ],
                        [/crkey/i],
                        [
                            [s, "Chromecast"],
                            [c, E],
                            [d, v]
                        ],
                        [/droid.+aft(\w)( bui|\))/i],
                        [s, [c, b],
                            [d, v]
                        ],
                        [/\(dtv[\);].+(aquos)/i],
                        [s, [c, "Sharp"],
                            [d, v]
                        ],
                        [/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, /hbbtv\/\d+\.\d+\.\d+ +\([\w ]*; *(\w[^;]*);([^;]*)/i],
                        [
                            [c, j],
                            [s, j],
                            [d, v]
                        ],
                        [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i],
                        [
                            [d, v]
                        ],
                        [/((pebble))app/i],
                        [c, s, [d, f]],
                        [/droid.+; (glass) \d/i],
                        [s, [c, E],
                            [d, f]
                        ],
                        [/droid.+; (wt63?0{2,3})\)/i],
                        [s, [c, D],
                            [d, f]
                        ],
                        [/(quest( 2)?)/i],
                        [s, [c, L],
                            [d, f]
                        ],
                        [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i],
                        [c, [d, g]],
                        [/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i],
                        [s, [d, p]],
                        [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i],
                        [s, [d, m]],
                        [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i],
                        [
                            [d, m]
                        ],
                        [/(phone|mobile(?:[;\/]| safari)|pda(?=.+windows ce))/i],
                        [
                            [d, p]
                        ],
                        [/(android[-\w\. ]{0,9});.+buil/i],
                        [s, [c, "Generic"]]
                    ],
                    engine: [
                        [/windows.+ edge\/([\w\.]+)/i],
                        [l, [a, "EdgeHTML"]],
                        [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i],
                        [l, [a, "Blink"]],
                        [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, /ekioh(flow)\/([\w\.]+)/i, /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i, /(icab)[\/ ]([23]\.[\d\.]+)/i],
                        [a, l],
                        [/rv\:([\w\.]{1,9})\b.+(gecko)/i],
                        [l, a]
                    ],
                    os: [
                        [/microsoft (windows) (vista|xp)/i],
                        [a, l],
                        [/(windows) nt 6\.2; (arm)/i, /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i, /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i],
                        [a, [l, F, B]],
                        [/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i],
                        [
                            [a, "Windows"],
                            [l, F, B]
                        ],
                        [/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, /cfnetwork\/.+darwin/i],
                        [
                            [l, /_/g, "."],
                            [a, "iOS"]
                        ],
                        [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i],
                        [
                            [a, "Mac OS"],
                            [l, /_/g, "."]
                        ],
                        [/droid ([\w\.]+)\b.+(android[- ]x86)/i],
                        [l, a],
                        [/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i, /(blackberry)\w*\/([\w\.]*)/i, /(tizen|kaios)[\/ ]([\w\.]+)/i, /\((series40);/i],
                        [a, l],
                        [/\(bb(10);/i],
                        [l, [a, S]],
                        [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i],
                        [l, [a, "Symbian"]],
                        [/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i],
                        [l, [a, "Firefox OS"]],
                        [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i],
                        [l, [a, "webOS"]],
                        [/crkey\/([\d\.]+)/i],
                        [l, [a, "Chromecast"]],
                        [/(cros) [\w]+ ([\w\.]+\w)/i],
                        [
                            [a, "Chromium OS"], l
                        ],
                        [/(nintendo|playstation) ([wids345portablevuch]+)/i, /(xbox); +xbox ([^\);]+)/i, /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i, /(mint)[\/\(\) ]?(\w*)/i, /(mageia|vectorlinux)[; ]/i, /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i, /(hurd|linux) ?([\w\.]*)/i, /(gnu) ?([\w\.]*)/i, /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, /(haiku) (\w+)/i],
                        [a, l],
                        [/(sunos) ?([\w\.\d]*)/i],
                        [
                            [a, "Solaris"], l
                        ],
                        [/((?:open)?solaris)[-\/ ]?([\w\.]*)/i, /(aix) ((\d)(?=\.|\)| )[\w\.])*/i, /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux)/i, /(unix) ?([\w\.]*)/i],
                        [a, l]
                    ]
                },
                H = function(i, s) {
                    if (typeof i === o && (s = i, i = t), !(this instanceof H)) return new H(i, s).getResult();
                    var a = i || (typeof e !== r && e.navigator && e.navigator.userAgent ? e.navigator.userAgent : ""),
                        d = s ? function(e, t) {
                            var i = {};
                            for (var r in e) t[r] && t[r].length % 2 == 0 ? i[r] = t[r].concat(e[r]) : i[r] = e[r];
                            return i
                        }(q, s) : q;
                    return this.getBrowser = function() {
                        var e, i = {};
                        return i.name = t, i.version = t, $.call(i, a, d.browser), i.major = typeof(e = i.version) === n ? e.replace(/[^\d\.]/g, "").split(".")[0] : t, i
                    }, this.getCPU = function() {
                        var e = {};
                        return e.architecture = t, $.call(e, a, d.cpu), e
                    }, this.getDevice = function() {
                        var e = {};
                        return e.vendor = t, e.model = t, e.type = t, $.call(e, a, d.device), e
                    }, this.getEngine = function() {
                        var e = {};
                        return e.name = t, e.version = t, $.call(e, a, d.engine), e
                    }, this.getOS = function() {
                        var e = {};
                        return e.name = t, e.version = t, $.call(e, a, d.os), e
                    }, this.getResult = function() {
                        return {
                            ua: this.getUA(),
                            browser: this.getBrowser(),
                            engine: this.getEngine(),
                            os: this.getOS(),
                            device: this.getDevice(),
                            cpu: this.getCPU()
                        }
                    }, this.getUA = function() {
                        return a
                    }, this.setUA = function(e) {
                        return a = typeof e === n && e.length > 255 ? j(e, 255) : e, this
                    }, this.setUA(a), this
                };
            H.VERSION = "1.0.2", H.BROWSER = V([a, l, "major"]), H.CPU = V([u]), H.DEVICE = V([s, c, d, h, p, v, m, f, g]), H.ENGINE = H.OS = V([a, l]), I.exports && (R = I.exports = H), R.UAParser = H;
            var G = typeof e !== r && (e.jQuery || e.Zepto);
            if (G && !G.ua) {
                var z = new H;
                G.ua = z.getResult(), G.ua.get = function() {
                    return z.getUA()
                }, G.ua.set = function(e) {
                    z.setUA(e);
                    var t = z.getResult();
                    for (var i in t) G.ua[i] = t[i]
                }
            }
        }("object" == typeof window ? window : k);
    var _ = new(0, E.exports);
    const C = {
        verbose: 0,
        trace: 1,
        debug: 2,
        information: 3,
        warning: 4,
        error: 5
    };
    const M = new class {
            constructor() {
                this.ws = null, this.keepAliveInterval = -1, this.host = "", this.token = "", this.logLevelNumber = 3, this.reconnectPeriod = -1, this.reconnectTimeGap = 1e3, this.collectionPeriod = 5
            }
            createWebSocket(e, t) {
                return this.host = e, this.token = t, this.close(), this.clearKeepAliveTimer(), new Promise((r => {
                    this.ws = new WebSocket(e), this.ws.onopen = () => {
                        const e = _.getOS(),
                            o = _.getBrowser(),
                            n = _.getDevice(),
                            s = {
                                token: t,
                                userInfo: {
                                    sdkVersion: i,
                                    platform: "web",
                                    platformVersion: `${o.name}/${o.version}`,
                                    osName: e.name,
                                    osVersion: e.version,
                                    deviceModel: n.model || ""
                                }
                            };
                        this.send({
                            method: "CnL.Registration",
                            params: s
                        }), this.keepAliveInterval = window.setInterval((() => {
                            this.send({
                                method: "CnL.KeepAlive",
                                params: {}
                            })
                        }), 5e4), r(!0)
                    }, this.ws.onerror = () => {
                        "signin" === me.signStatus && this.reconnect()
                    }, this.ws.onclose = () => {
                        "signin" === me.signStatus && this.reconnect()
                    }, this.ws.onmessage = e => {
                        const t = JSON.parse(e.data);
                        "CnL.Push" === t.method && this.setLevel(t.params.config.log_level), t.result && t.result.config && (t.result.config.cnl && (this.reconnectPeriod = t.result.config.cnl.reconnect_period), t.result.config.quality_metrics && (this.collectionPeriod = t.result.config.quality_metrics.collection_period))
                    }
                }))
            }
            reconnect() {
                return t(this, void 0, void 0, (function*() {
                    var e;
                    this.close(), this.reconnectPeriod > -1 && (yield(e = this.reconnectPeriod, new Promise((t => {
                        window.setTimeout(t, e)
                    })))), window.setTimeout((() => {
                        this.createWebSocket(this.host, this.token)
                    }), this.reconnectTimeGap), this.reconnectTimeGap >= 16e3 ? this.reconnectTimeGap = 16e3 : this.reconnectTimeGap = 2 * this.reconnectTimeGap
                }))
            }
            send(e, i = !1) {
                return t(this, void 0, void 0, (function*() {
                    if (!this.ws) return;
                    const t = e.method,
                        r = e.params;
                    if (r.version = "1.0", "CnL.Log" === t) {
                        const e = r.logs[0].level;
                        if (C[e] < this.logLevelNumber) return
                    }
                    const o = S.get().toString();
                    let n = "";
                    if (n = i ? JSON.stringify(function(e, t) {
                        const i = new d(e, t);
                        return f(i, !0), i
                    }(t, r)) : JSON.stringify(p(o, t, r)), this.ws.readyState !== this.ws.CONNECTING) this.ws.readyState !== this.ws.CLOSED && this.ws.readyState !== this.ws.CLOSING && this.ws.send(n);
                    else {
                        const e = window.setInterval((() => {
                            var t, i, r;
                            (null === (t = this.ws) || void 0 === t ? void 0 : t.readyState) === (null === (i = this.ws) || void 0 === i ? void 0 : i.OPEN) && (window.clearInterval(e), null === (r = this.ws) || void 0 === r || r.send(n))
                        }), 10)
                    }
                }))
            }
            clearKeepAliveTimer() {
                window.clearInterval(this.keepAliveInterval), this.keepAliveInterval = -1
            }
            close() {
                var e;
                null === (e = this.ws) || void 0 === e || e.close(), this.ws = null
            }
            destroy() {
                this.close(), this.clearKeepAliveTimer(), this.logLevelNumber = 3, this.reconnectPeriod = -1, this.reconnectTimeGap = 1e3
            }
            setLevel(e) {
                this.logLevelNumber = C[e]
            }
        },
        A = {
            trace: 0,
            debug: 1,
            info: 2,
            error: 3,
            off: 4
        },
        T = () => {
            const e = new Date,
                t = e.getFullYear(),
                i = e.getMonth() + 1,
                r = e.getDate(),
                o = e.getHours(),
                n = e.getMinutes(),
                s = e.getSeconds();
            return `${t}.${i>=10?i:"0"+i}.${r>=10?r:"0"+r} ${o>=10?o:"0"+o}:${n>=10?n:"0"+n}:${s>=10?s:"0"+s}.${e.getMilliseconds()}`
        },
        O = (e, t) => {
            const i = e.map((e => ("object" == typeof e && (e = JSON.stringify(e)), e))).join(" "),
                r = {
                    sdkVersion: "web_2.2.3",
                    logs: [{
                        date: (new Date).toISOString(),
                        level: t,
                        message: i
                    }]
                };
            return M.send({
                method: "CnL.Log",
                params: r
            }, !0), i
        },
        P = {
            logLevelNumber: 0,
            setLevel(e) {
                this.logLevelNumber = A[e]
            },
            trace(...e) {
                this.logLevelNumber <= A.trace ? console.log(`[TRACE] [${T()}]`, O(e, "trace")) : O(e, "trace")
            },
            debug(...e) {
                this.logLevelNumber <= A.debug ? console.log(`[DEBUG] [${T()}]`, O(e, "debug")) : O(e, "debug")
            },
            info(...e) {
                this.logLevelNumber <= A.info ? console.log(`[INFO] [${T()}]`, O(e, "information")) : O(e, "information")
            },
            error(...e) {
                this.logLevelNumber <= A.error ? console.error(`[ERROR] [${T()}]`, O(e, "error")) : O(e, "error")
            }
        },
        x = e => (t, i, r) => {
            const o = r.value;
            return r.value = function(...r) {
                let n = "";
                try {
                    n = "[method][" + t.constructor.name + "." + i + "] arguments = " + JSON.stringify(r)
                } catch (e) {
                    const r = e.message;
                    n = "[method][" + t.constructor.name + "." + i + "] arguments = " + r
                }
                return P[e](n), o.apply(this, r)
            }, r
        };
    class D extends Error {
        constructor(e, t) {
            super(t), this.code = e, Object.setPrototypeOf(this, D.prototype)
        }
        getCode() {
            return this.code
        }
        getMessage() {
            return this.message
        }
    }
    class L extends D {
        constructor(e, t) {
            super(e, t), this.name = "ServerError"
        }
    }
    class V extends D {
        constructor(e, t, i) {
            super(e, t), this.name = "ClientError", this.origin = i
        }
    }
    class N {
        constructor() {
            this.headers = {}, this.host = ""
        }
        setHost(e) {
            this.host = e
        }
        setHeaders(e) {
            this.headers = e
        }
        request(e, i = {}) {
            return t(this, void 0, void 0, (function*() {
                try {
                    const {
                        method: t,
                        params: r
                    } = e;
                    "Provision" !== t && "ExtendTTL" !== t && (r.version = "2.0");
                    const {
                        httpMethod: o = "post",
                        path: n = ""
                    } = i, s = S.get().toString(), a = JSON.stringify(p(s, t, r)), d = this.host + n;
                    P.trace(`[${t}] ${a}`);
                    const c = yield fetch(d, Object.assign(Object.assign({}, this.headers), {
                        method: o,
                        body: a
                    })), l = yield c.json();
                    if ("Provision" !== t && "ExtendTTL" !== t && "error" in l) {
                        P.error(l);
                        throw new L(l.error.code, l.error.message)
                    }
                    return P.trace(`[RESULT] ${JSON.stringify(l)}`), l
                } catch (e) {
                    const t = e,
                        i = t.message;
                    P.error(i);
                    throw new V(1904, "HTTP ????????? ????????? ??????????????????.", t)
                }
            }))
        }
    }
    class U extends N {
        constructor() {
            super(), this.setHeaders({
                method: "post",
                headers: {
                    "Content-Type": "application/json"
                }
            })
        }
        authorize(e, t = "") {
            const i = e.endpoint || "https://icl2-provisioning-ap2.k9ertc.io/api/rpc";
            return this.setHost(i), "token" in e ? this.externally(e, t) : this.internally(e, t)
        }
        refreshToken(e, i) {
            return t(this, void 0, void 0, (function*() {
                const t = {
                        serviceId: e,
                        token: i
                    },
                    r = yield this.request({
                        method: "ExtendTTL",
                        params: t
                    });
                if ("error" in r) {
                    P.error("refreshToken", r);
                    throw new L(r.error.code, r.error.message)
                }
                const {
                    result: o
                } = r;
                return o
            }))
        }
        internally(e, i) {
            return t(this, void 0, void 0, (function*() {
                const {
                    serviceId: t,
                    serviceSecret: o
                } = e, n = o.split(":"), s = n[0], a = n[1];
                if (!t || !s || !a) throw new V(1103, "????????? ?????? ????????? ????????? ???????????? ???????????????.");
                const d = "internal",
                    c = "Provision",
                    l = {
                        scheme: d,
                        serviceId: t,
                        version: "1.0"
                    },
                    u = yield this.request({
                        method: c,
                        params: l
                    });
                if ("result" in u) throw P.error("internally", u), new Error("Provisioning Failed");
                if (!("data" in u.error)) {
                    P.error("internally", u);
                    throw new L(u.error.code, u.error.message)
                }
                const {
                    nonce: h
                } = u.error.data, p = yield r([t, s, a].join(":")), m = yield r([p, h].join(":")), v = {
                    version: "1.0",
                    serviceId: t,
                    scheme: d,
                    fingerprint: i,
                    auth: {
                        nonce: h,
                        key: s,
                        value: m
                    }
                }, f = yield this.request({
                    method: c,
                    params: v
                });
                if ("error" in f) {
                    P.error("internally", f);
                    throw new L(f.error.code, f.error.message)
                }
                const {
                    result: g
                } = f;
                return g
            }))
        }
        externally(e, i) {
            return t(this, void 0, void 0, (function*() {
                const {
                    token: t,
                    serviceId: r
                } = e;
                if (!r || !t) throw new V(1103, "????????? ?????? ????????? ????????? ???????????? ???????????????.");
                const o = {
                        serviceId: r,
                        scheme: "external",
                        fingerprint: i,
                        auth: {
                            value: t
                        }
                    },
                    n = yield this.request({
                        method: "Provision",
                        params: o
                    });
                if ("error" in n) {
                    P.error("externally", n);
                    throw new L(n.error.code, n.error.message)
                }
                const {
                    result: s
                } = n;
                return s
            }))
        }
    }
    e([x("info")], U.prototype, "authorize", null), e([x("info")], U.prototype, "refreshToken", null), e([x("info")], U.prototype, "internally", null), e([x("info")], U.prototype, "externally", null);
    var j = {
        exports: {}
    };
    ! function(e) {
        var t = Object.prototype.hasOwnProperty,
            i = "~";

        function r() {}

        function o(e, t, i) {
            this.fn = e, this.context = t, this.once = i || !1
        }

        function n(e, t, r, n, s) {
            if ("function" != typeof r) throw new TypeError("The listener must be a function");
            var a = new o(r, n || e, s),
                d = i ? i + t : t;
            return e._events[d] ? e._events[d].fn ? e._events[d] = [e._events[d], a] : e._events[d].push(a) : (e._events[d] = a, e._eventsCount++), e
        }

        function s(e, t) {
            0 == --e._eventsCount ? e._events = new r : delete e._events[t]
        }

        function a() {
            this._events = new r, this._eventsCount = 0
        }
        Object.create && (r.prototype = Object.create(null), (new r).__proto__ || (i = !1)), a.prototype.eventNames = function() {
            var e, r, o = [];
            if (0 === this._eventsCount) return o;
            for (r in e = this._events) t.call(e, r) && o.push(i ? r.slice(1) : r);
            return Object.getOwnPropertySymbols ? o.concat(Object.getOwnPropertySymbols(e)) : o
        }, a.prototype.listeners = function(e) {
            var t = i ? i + e : e,
                r = this._events[t];
            if (!r) return [];
            if (r.fn) return [r.fn];
            for (var o = 0, n = r.length, s = new Array(n); o < n; o++) s[o] = r[o].fn;
            return s
        }, a.prototype.listenerCount = function(e) {
            var t = i ? i + e : e,
                r = this._events[t];
            return r ? r.fn ? 1 : r.length : 0
        }, a.prototype.emit = function(e, t, r, o, n, s) {
            var a = i ? i + e : e;
            if (!this._events[a]) return !1;
            var d, c, l = this._events[a],
                u = arguments.length;
            if (l.fn) {
                switch (l.once && this.removeListener(e, l.fn, void 0, !0), u) {
                    case 1:
                        return l.fn.call(l.context), !0;
                    case 2:
                        return l.fn.call(l.context, t), !0;
                    case 3:
                        return l.fn.call(l.context, t, r), !0;
                    case 4:
                        return l.fn.call(l.context, t, r, o), !0;
                    case 5:
                        return l.fn.call(l.context, t, r, o, n), !0;
                    case 6:
                        return l.fn.call(l.context, t, r, o, n, s), !0
                }
                for (c = 1, d = new Array(u - 1); c < u; c++) d[c - 1] = arguments[c];
                l.fn.apply(l.context, d)
            } else {
                var h, p = l.length;
                for (c = 0; c < p; c++) switch (l[c].once && this.removeListener(e, l[c].fn, void 0, !0), u) {
                    case 1:
                        l[c].fn.call(l[c].context);
                        break;
                    case 2:
                        l[c].fn.call(l[c].context, t);
                        break;
                    case 3:
                        l[c].fn.call(l[c].context, t, r);
                        break;
                    case 4:
                        l[c].fn.call(l[c].context, t, r, o);
                        break;
                    default:
                        if (!d)
                            for (h = 1, d = new Array(u - 1); h < u; h++) d[h - 1] = arguments[h];
                        l[c].fn.apply(l[c].context, d)
                }
            }
            return !0
        }, a.prototype.on = function(e, t, i) {
            return n(this, e, t, i, !1)
        }, a.prototype.once = function(e, t, i) {
            return n(this, e, t, i, !0)
        }, a.prototype.removeListener = function(e, t, r, o) {
            var n = i ? i + e : e;
            if (!this._events[n]) return this;
            if (!t) return s(this, n), this;
            var a = this._events[n];
            if (a.fn) a.fn !== t || o && !a.once || r && a.context !== r || s(this, n);
            else {
                for (var d = 0, c = [], l = a.length; d < l; d++)(a[d].fn !== t || o && !a[d].once || r && a[d].context !== r) && c.push(a[d]);
                c.length ? this._events[n] = 1 === c.length ? c[0] : c : s(this, n)
            }
            return this
        }, a.prototype.removeAllListeners = function(e) {
            var t;
            return e ? (t = i ? i + e : e, this._events[t] && s(this, t)) : (this._events = new r, this._eventsCount = 0), this
        }, a.prototype.off = a.prototype.removeListener, a.prototype.addListener = a.prototype.on, a.prefixed = i, a.EventEmitter = a, e.exports = a
    }(j);
    var $ = j.exports;
    class F extends N {
        constructor() {
            super(), this.emitter = new $
        }
        setRoomId(e) {
            return t(this, void 0, void 0, (function*() {
                this.roomId = e
            }))
        }
        setParticipantId(e) {
            return t(this, void 0, void 0, (function*() {
                this.participantId = e
            }))
        }
        sendEnterRoom() {
            return t(this, void 0, void 0, (function*() {
                const e = _.getOS(),
                    t = _.getBrowser(),
                    r = {
                        roomId: this.roomId,
                        userInfo: {
                            sdkVersion: i,
                            platform: "web",
                            platformVersion: `${t.name}/${t.version}`,
                            osName: e.name,
                            osVersion: e.version,
                            deviceModel: ""
                        }
                    },
                    o = yield this.request({
                        method: "Room.EnterRoom",
                        params: r
                    });
                if ("error" in o) throw new Error(JSON.stringify(o.error));
                return this.sign = o.result.sign, o
            }))
        }
        sendCreateSession(e, i, r) {
            return t(this, void 0, void 0, (function*() {
                const t = {
                        roomId: this.roomId,
                        participantId: this.participantId,
                        sign: this.sign,
                        direction: e,
                        index: i,
                        desc: r
                    },
                    o = yield this.request({
                        method: "Room.CreateSession",
                        params: t
                    });
                if ("error" in o) {
                    const e = new L(o.error.code, o.error.message);
                    throw this.emitter.emit("error", e), e
                }
                return o
            }))
        }
        sendAddCandidate(e, i, r) {
            return t(this, void 0, void 0, (function*() {
                const t = {
                        roomId: this.roomId,
                        participantId: this.participantId,
                        sign: this.sign,
                        direction: e,
                        index: i,
                        candidate: r
                    },
                    o = yield this.request({
                        method: "Room.AddCandidate",
                        params: t
                    });
                if ("error" in o) {
                    const e = new L(o.error.code, o.error.message);
                    throw -23005 === o.error.code && this.emitter.emit("error", e), e
                }
                return o
            }))
        }
        sendRestartIce(e, i, r) {
            return t(this, void 0, void 0, (function*() {
                const t = {
                        roomId: this.roomId,
                        participantId: this.participantId,
                        sign: this.sign,
                        direction: e,
                        index: i,
                        desc: r
                    },
                    o = yield this.request({
                        method: "Room.RestartIce",
                        params: t
                    });
                if ("error" in o) {
                    const e = new L(o.error.code, o.error.message);
                    throw -23005 === o.error.code && this.emitter.emit("error", e), e
                }
                return o
            }))
        }
        sendDestroySession(e, i) {
            return t(this, void 0, void 0, (function*() {
                const t = {
                        roomId: this.roomId,
                        participantId: this.participantId,
                        sign: this.sign,
                        direction: e,
                        index: i
                    },
                    r = yield this.request({
                        method: "Room.DestroySession",
                        params: t
                    });
                if ("error" in r) {
                    const e = new L(r.error.code, r.error.message);
                    throw -23005 === r.error.code && this.emitter.emit("error", e), e
                }
                return r
            }))
        }
        on(e, t) {
            this.emitter.on(e, t)
        }
    }
    e([x("info")], F.prototype, "setRoomId", null), e([x("info")], F.prototype, "setParticipantId", null), e([x("info")], F.prototype, "sendEnterRoom", null), e([x("debug")], F.prototype, "sendCreateSession", null), e([x("debug")], F.prototype, "sendAddCandidate", null), e([x("debug")], F.prototype, "sendRestartIce", null), e([x("info")], F.prototype, "sendDestroySession", null);
    class B {
        constructor() {
            this.emitter = new $, this.methodMap = new Map, this.toStream = () => console.warn("Please set toStream function!")
        }
        handleMessage(e) {
            const t = m(e),
                i = e => {
                    const {
                        payload: t
                    } = e, i = "id" in t, r = "method" in t;
                    if (i && !r) {
                        const e = String(t.id),
                            i = this.methodMap.get(e);
                        return this.emitter.emit(e, t), void(i && this.emitter.emit(i, t))
                    }
                    if (r && !i) {
                        const e = t.method;
                        return this.emitter.emit(e, t)
                    }
                    console.error("invalid message", e)
                };
            Array.isArray(t) ? t.forEach(i) : i(t)
        }
        call(e, t) {
            return t.version = "2.0", new Promise((i => {
                const r = S.get().toString();
                this.methodMap.set(r, e), this.emitter.once(r, i);
                const o = p(r, e, t);
                this.toStream(o)
            }))
        }
        on(e, t) {
            this.emitter.on(e, t)
        }
        off(e, t) {
            this.emitter.off(e, t)
        }
    }
    const q = () => null,
        H = _.getBrowser();
    class G {
        constructor(e, t, i) {
            this.restartIceInterval = -1, this.config = {
                cpuOveruseDetection: !0,
                maxFramerate: {
                    l: 10,
                    m: 20,
                    h: 30
                },
                voiceMode: !0
            }, this.emitter = new $, this.jsonrpc = new B, this.roomApiClient = e, this.direction = t, this.index = 0, Object.assign(this.config, i), this.jsonrpc.toStream = e => {
                this.dataChannel && "open" === this.dataChannel.readyState && (P.trace(`[${this.direction}] [SEND]`, e), this.dataChannel.send(JSON.stringify(e)))
            }
        }
        create(e) {
            return new Promise(((t, i) => {
                this.emitter.once("SessionCreated", (() => {
                    t()
                }));
                try {
                    this.createPeerConnection(e)
                } catch (e) {
                    i(new V(1401, "PeerConnection ????????? ??????????????????.", e))
                }
                try {
                    this.createDataChannel()
                } catch (e) {
                    i(new V(1402, "????????? ?????? ????????? ??????????????????.", e))
                }
            }))
        }
        destroy() {
            return t(this, void 0, void 0, (function*() {
                this.close(), yield this.roomApiClient.sendDestroySession(this.direction, this.index)
            }))
        }
        close() {
            return t(this, void 0, void 0, (function*() {
                this.peerConnection.close(), this.dataChannel.close()
            }))
        }
        on(e, t) {
            this.emitter.on(e, t)
        }
        off(e, t) {
            this.emitter.off(e, t)
        }
        createPeerConnection(e) {
            this.peerConnection && this.peerConnection.close();
            const i = Object.assign(Object.assign({}, e), {
                    bundlePolicy: "max-bundle",
                    iceTransportPolicy: "all",
                    rtcpMuxPolicy: "require",
                    iceCandidatePoolSize: 0,
                    sdpSemantics: "unified-plan",
                    extmapAllowMixed: !0
                }),
                r = {
                    mandatory: {},
                    optional: [{
                        enableDscp: !0
                    }]
                };
            this.config.cpuOveruseDetection ? (r.optional.push({
                googCpuOveruseDetection: !0
            }), r.optional.push({
                googCpuOveruseEncodeUsage: !0
            }), r.optional.push({
                googCpuUnderuseThreshold: 55
            }), r.optional.push({
                googCpuOveruseThreshold: 85
            })) : r.optional.push({
                googCpuOveruseDetection: !1
            }), this.config.voiceMode || (r.mandatory.googHighpassFilter = !1, r.mandatory.googEchoCancellation = !1, r.mandatory.googEchoCancellation2 = !1, r.mandatory.googAutoGainControl = !1, r.mandatory.googAutoGainControl2 = !1, r.mandatory.googNoiseSuppression = !1, r.mandatory.googNoiseSuppression2 = !1, r.mandatory.googTypingNoiseDetection = !1, r.mandatory.echoCancellation = !1), this.peerConnection = new RTCPeerConnection(i, r), P.debug(`[${this.direction}] peerConnection = ${JSON.stringify(i)}`), this.peerConnection.onicecandidate = e => {
                e.candidate && (this.roomApiClient.sendAddCandidate(this.direction, this.index, e.candidate), P.debug(`[${this.direction}] candidate = ${JSON.stringify(e.candidate)}`))
            }, this.peerConnection.onnegotiationneeded = () => t(this, void 0, void 0, (function*() {
                P.debug(`[${this.direction}] onnegotiationneeded`);
                try {
                    const e = yield this.peerConnection.createOffer();
                    yield this.peerConnection.setLocalDescription(e), P.debug(`[${this.direction}] create offer = ${JSON.stringify(e)}`);
                    const t = yield this.roomApiClient.sendCreateSession(this.direction, this.index, e), i = new RTCSessionDescription(t.result.desc);
                    yield this.peerConnection.setRemoteDescription(i), P.debug(`[${this.direction}] receive answer = ${JSON.stringify(i)}`)
                } catch (e) {
                    const t = e.message;
                    P.error(`[${this.direction}] onnegotiationneeded = ${t}`)
                }
            })), this.peerConnection.onconnectionstatechange = e => t(this, void 0, void 0, (function*() {
                P.debug(`[${this.direction}] onconnectionstatechange = ${e.target.connectionState}`), this._restartIceTimerStop(), "disconnected" === e.target.connectionState ? this._restartIceTimerStart() : "failed" === e.target.connectionState && (P.error(`[${this.direction}] onconnectionstatechange = ${e.target.connectionState}`), this.emitter.emit("error", new V(1411, "PeerConnection ?????? ????????? failed ?????????.")))
            })), this.peerConnection.oniceconnectionstatechange = e => {
                P.debug(`[${this.direction}] oniceconnectionstatechange = ${e.target.iceConnectionState}`), "Firefox" === H.name && (this._restartIceTimerStop(), "disconnected" === e.target.iceConnectionState ? this._restartIceTimerStart() : "failed" === e.target.iceConnectionState && (P.error(`[${this.direction}] onconnectionstatechange = ${e.target.iceConnectionState}`), this.emitter.emit("error", new V(1411, "PeerConnection ?????? ????????? failed ?????????."))))
            }, this.peerConnection.ontrack = q
        }
        createDataChannel() {
            this.dataChannel && this.dataChannel.close(), this.dataChannel = this.peerConnection.createDataChannel(this.direction), this.dataChannel.onopen = () => {
                P.debug(`[${this.direction}] dataChannel is opened`)
            }, this.dataChannel.onclose = () => {
                P.debug(`[${this.direction}] dataChannel is closed`)
            }, this.dataChannel.onerror = e => {
                let t = e.error;
                P.error(`[${this.direction}] dataChannel occurred error. reason=${JSON.stringify(t)}`)
            }, this.dataChannel.onmessage = e => t(this, void 0, void 0, (function*() {
                const t = yield new Response(e.data).text();
                P.trace(`[${this.direction}] [RECEIVE] dataChannel.onmessage = ${t}`), this.jsonrpc.handleMessage(t)
            }))
        }
        _restartIceTimerStart() {
            this.restartIceInterval = window.setInterval((() => {
                navigator.onLine && (this._restartIceTimerStop(), this._restartIce())
            }), 100)
        }
        _restartIceTimerStop() {
            window.clearInterval(this.restartIceInterval), this.restartIceInterval = -1
        }
        _restartIce() {
            return t(this, void 0, void 0, (function*() {
                try {
                    const e = yield this.peerConnection.createOffer({
                        iceRestart: !0
                    });
                    yield this.peerConnection.setLocalDescription(e), P.debug(`[${this.direction}](RestartICE) create offer = ${JSON.stringify(e)}`);
                    const t = yield this.roomApiClient.sendRestartIce(this.direction, this.index, e), i = new RTCSessionDescription(t.result.desc);
                    yield this.peerConnection.setRemoteDescription(i), P.debug(`[${this.direction}](RestartICE) receive answer = ${JSON.stringify(i)}`)
                } catch (e) {
                    const t = e.message;
                    P.error(`[${this.direction}](RestartICE) onconnectionstatechange = ${t}`)
                }
            }))
        }
        getAllStats() {
            return t(this, void 0, void 0, (function*() {
                const e = yield this.peerConnection.getStats(), t = {};
                return e.forEach((e => {
                    t[e.id] = e
                })), t
            }))
        }
    }
    e([x("info")], G.prototype, "create", null), e([x("info")], G.prototype, "destroy", null), e([x("info")], G.prototype, "close", null), e([x("info")], G.prototype, "createPeerConnection", null), e([x("info")], G.prototype, "createDataChannel", null), e([x("info")], G.prototype, "_restartIce", null);
    const z = (e, t) => {
            for (const i in e)
                if (t(e[i])) return !0;
            return !1
        },
        Q = (e, t) => {
            const i = [];
            for (const r in e) t(e[r]) && i.push(e[r]);
            return i
        },
        W = e => Object.values(e);
    class J extends G {
        constructor(e, t) {
            super(e, "down", t), this.receiverTrackMap = {}, this.fixedAudioReceiver = [], this.audioTransceivers = [], this.oldAudioStats = [], this.oldVideoStats = [], this.oldCandidatePair = null, this.addListeners()
        }
        addListeners() {
            this.jsonrpc.on("Room.OnParticipantsInfo", (e => {
                const {
                    params: t
                } = e;
                this.emitter.emit("ChangedParticipantsInfo", t)
            })), this.jsonrpc.on("Room.OnOffer", (e => {
                const {
                    params: t
                } = e;
                this.emitter.emit(t.negotiationId, t)
            })), this.jsonrpc.on("Room.OnError", (e => {
                const {
                    params: t
                } = e;
                t.negotiationId && this.emitter.emit(t.negotiationId, t)
            })), this.jsonrpc.on("Room.OnMessage", (e => {
                const {
                    params: t
                } = e;
                this.emitter.emit(t.type, t.data)
            })), this.jsonrpc.on("Room.OnStreamChanged", (e => {
                this.emitter.emit("StreamChanged", e)
            })), this.emitter.on("(system)", (e => t(this, void 0, void 0, (function*() {
                const {
                    negotiationId: t,
                    receivers: i,
                    desc: r
                } = e;
                yield this.peerConnection.setRemoteDescription(r);
                const o = yield this.peerConnection.createAnswer();
                yield this.peerConnection.setLocalDescription(o), yield this.callSetAnswer({
                    negotiationId: t,
                    desc: o
                });
                const n = this.peerConnection.getTransceivers();
                this.receiverTrackMap = n.reduce(((e, t) => {
                    const i = t.mid;
                    return i && "video" === t.receiver.track.kind && (e[i] = t.receiver.track), e
                }), {}), this.audioTransceivers = n.filter((e => "audio" === e.receiver.track.kind)), this.fixedAudioReceiver = this.audioTransceivers.map((e => e.receiver));
                const s = {
                    name: "init",
                    receivers: i
                };
                this.emitter.emit("UpdatedReceivers", s)
            }))))
        }
        getTrack(e) {
            return this.receiverTrackMap[e]
        }
        getTracks() {
            return W(this.receiverTrackMap)
        }
        addReceiver(e) {
            return new Promise(((i, r) => {
                const o = S.get().toString();
                this.emitter.once(o, (e => t(this, void 0, void 0, (function*() {
                    if ("code" in e) {
                        P.error("addReceiver", e);
                        const t = new L(e.code, e.message);
                        return r(t)
                    }
                    try {
                        const {
                            receivers: t,
                            desc: r
                        } = e;
                        yield this.peerConnection.setRemoteDescription(r);
                        const n = yield this.peerConnection.createAnswer();
                        yield this.peerConnection.setLocalDescription(n), yield this.callSetAnswer({
                            negotiationId: o,
                            desc: n
                        });
                        this.peerConnection.getTransceivers().reduce(((e, i) => {
                            const r = i.mid,
                                o = t.find((e => e.receiverId === r));
                            return o && "video" === i.receiver.track.kind && (this.receiverTrackMap[o.receiverId] = i.receiver.track), e
                        }), {});
                        const s = {
                            name: "add",
                            receivers: t
                        };
                        this.emitter.emit("UpdatedReceivers", s), i()
                    } catch (e) {
                        const t = e,
                            i = t.message;
                        r(new V(1448, `????????? ?????? ??????(${i})`, t))
                    }
                }))));
                try {
                    this.callAddReceiver({
                        negotiationId: o,
                        receivers: e
                    })
                } catch (e) {
                    r(e)
                }
            }))
        }
        getFixedAudioReceiver() {
            return this.fixedAudioReceiver
        }
        removeReceiver(e) {
            return new Promise(((i, r) => {
                const o = S.get().toString(),
                    n = e.map((e => ({
                        receiverId: e
                    })));
                this.emitter.once(o, (e => t(this, void 0, void 0, (function*() {
                    if ("code" in e) {
                        P.error("removeReceiver", e);
                        const t = new L(e.code, e.message);
                        return r(t)
                    }
                    try {
                        const {
                            receivers: t,
                            desc: r
                        } = e;
                        yield this.peerConnection.setRemoteDescription(r);
                        const n = yield this.peerConnection.createAnswer();
                        yield this.peerConnection.setLocalDescription(n), yield this.callSetAnswer({
                            negotiationId: o,
                            desc: n
                        });
                        const s = this.peerConnection.getTransceivers();
                        this.receiverTrackMap = s.reduce(((e, t) => {
                            const i = t.mid;
                            return i && "video" === t.receiver.track.kind && (e[i] = t.receiver.track), e
                        }), {});
                        const a = {
                            name: "remove",
                            receivers: t
                        };
                        this.emitter.emit("UpdatedReceivers", a), i()
                    } catch (e) {
                        const t = e,
                            i = t.message;
                        r(new V(0, i, t))
                    }
                }))));
                try {
                    this.callRemoveReceiver({
                        negotiationId: o,
                        receivers: n
                    })
                } catch (e) {
                    r(e)
                }
            }))
        }
        assignStream(e) {
            return t(this, void 0, void 0, (function*() {
                yield this.callAssignStream({
                    receivers: e
                })
            }))
        }
        configureReceiver(e) {
            return t(this, void 0, void 0, (function*() {
                yield this._callConfigureReceiver({
                    receivers: e
                })
            }))
        }
        callAddReceiver(e) {
            return t(this, void 0, void 0, (function*() {
                const t = yield this.jsonrpc.call("Room.AddReceiver", e);
                if ("error" in t) throw new L(t.error.code, t.error.message);
                return t
            }))
        }
        callRemoveReceiver(e) {
            return t(this, void 0, void 0, (function*() {
                const t = yield this.jsonrpc.call("Room.RemoveReceiver", e);
                if ("error" in t) throw new L(t.error.code, t.error.message);
                return t
            }))
        }
        callSetAnswer(e) {
            return t(this, void 0, void 0, (function*() {
                const t = yield this.jsonrpc.call("Room.SetAnswer", e);
                if ("error" in t) throw new L(t.error.code, t.error.message);
                return t
            }))
        }
        callAssignStream(e) {
            return t(this, void 0, void 0, (function*() {
                const t = yield this.jsonrpc.call("Room.AssignStream", e);
                if ("error" in t) throw new L(t.error.code, t.error.message);
                return t
            }))
        }
        _callConfigureReceiver(e) {
            return t(this, void 0, void 0, (function*() {
                const t = yield this.jsonrpc.call("Room.ConfigureReceiver", e);
                if ("error" in t) throw new L(t.error.code, t.error.message);
                return t
            }))
        }
        getStats() {
            var e;
            return t(this, void 0, void 0, (function*() {
                const t = this.peerConnection.getTransceivers(),
                    i = [],
                    r = [];
                let o = {};
                for (const n of t) {
                    const t = yield n.receiver.getStats(), s = {
                        mid: n.mid,
                        items: []
                    };
                    t.forEach((e => {
                        s.items.push(e), "candidate-pair" === e.type && (o = e)
                    })), "audio" === (null === (e = n.receiver.track) || void 0 === e ? void 0 : e.kind) ? i.push(s) : r.push(s)
                }
                const n = [];
                i.forEach((e => {
                    const t = {
                        mid: e.mid,
                        inboundRtp: null,
                        track: null
                    };
                    e.items.forEach((e => {
                        "inbound-rtp" === e.type ? t.inboundRtp = e : "track" === e.type && (t.track = e)
                    })), t.inboundRtp && t.track && n.push(t)
                }));
                const s = [];
                return r.forEach((e => {
                    const t = {
                        mid: e.mid,
                        inboundRtp: null,
                        track: null
                    };
                    e.items.forEach((e => {
                        "inbound-rtp" === e.type ? t.inboundRtp = e : "track" === e.type && (t.track = e)
                    })), t.inboundRtp && t.track && s.push(t)
                })), {
                    audioStats: n,
                    videoStats: s,
                    candidatePair: o
                }
            }))
        }
        _setOldAudioStats(e) {
            this.oldAudioStats = e
        }
        _setOldVideoStats(e) {
            this.oldVideoStats = e
        }
        _setOldCandidatePairStats(e) {
            this.oldCandidatePair = e
        }
    }
    e([x("info")], J.prototype, "addListeners", null), e([x("info")], J.prototype, "getTrack", null), e([x("info")], J.prototype, "getTracks", null), e([x("info")], J.prototype, "addReceiver", null), e([x("info")], J.prototype, "removeReceiver", null), e([x("info")], J.prototype, "assignStream", null), e([x("info")], J.prototype, "configureReceiver", null), e([x("info")], J.prototype, "callAddReceiver", null), e([x("info")], J.prototype, "callRemoveReceiver", null), e([x("debug")], J.prototype, "callSetAnswer", null), e([x("info")], J.prototype, "callAssignStream", null), e([x("debug")], J.prototype, "_callConfigureReceiver", null);
    class K extends G {
        constructor(e, t) {
            super(e, "up", t), this.streamIdMidMap = {}, this.activeProfile = "l", this.oldAudioStats = [], this.oldVideoStats = [], this.oldCandidatePair = null, this.addListeners()
        }
        addStream({
                      audioType: e,
                      audioTrack: i,
                      audioExtraValue: r,
                      videoType: o,
                      localVideo: n,
                      videoExtraValue: s,
                      videoHd: a,
                      record: d
                  }) {
            return new Promise(((c, l) => {
                const u = S.get().toString();
                this.emitter.once(u, (e => t(this, void 0, void 0, (function*() {
                    var t;
                    if ("code" in e) {
                        P.error("addStream", e);
                        const t = new L(e.code, e.message);
                        return l(t)
                    }
                    try {
                        const {
                            desc: r,
                            audio: o,
                            video: s
                        } = e;
                        yield this.peerConnection.setRemoteDescription(r), o && (yield this._replaceAudioTrack(o, i)), s && (yield this._replaceVideoTrack(s, n));
                        const a = yield this.peerConnection.createAnswer();
                        if (yield this.peerConnection.setLocalDescription(a), s && this._setVideoProfiles(s), yield this._callSetAnswer({
                            negotiationId: u,
                            desc: a
                        }), o && "none" !== o.type) {
                            const e = null !== (t = this.streamIdMidMap[o.streamId]) && void 0 !== t ? t : {};
                            this.streamIdMidMap[o.streamId] = Object.assign(Object.assign({}, e), {
                                default: o.mid
                            })
                        }
                        s && "none" !== s.type && s.profiles.forEach((e => {
                            var t;
                            const i = null !== (t = this.streamIdMidMap[s.streamId]) && void 0 !== t ? t : {};
                            this.streamIdMidMap[s.streamId] = Object.assign(Object.assign({}, i), {
                                [e.profile]: e.mid
                            })
                        })), c({
                            audioOffer: o,
                            videoOffer: s
                        })
                    } catch (e) {
                        const t = e,
                            i = t.message;
                        l(new V(1442, `????????? ?????? ??????(${i})`, t))
                    }
                }))));
                try {
                    this._callAddStream({
                        negotiationId: u,
                        audio: {
                            type: e,
                            extraValue: r
                        },
                        video: {
                            type: o,
                            extraValue: s,
                            hd: a
                        },
                        record: d
                    })
                } catch (e) {
                    l(e)
                }
            }))
        }
        configureStream(e) {
            return t(this, void 0, void 0, (function*() {
                yield this._callConfigureStream({
                    streams: e
                })
            }))
        }
        removeStream(e) {
            return new Promise(((i, r) => {
                const o = S.get().toString(),
                    n = e.map((e => ({
                        streamId: e
                    })));
                this.emitter.once(o, (n => t(this, void 0, void 0, (function*() {
                    if ("code" in n) {
                        P.error("removeStream", n);
                        const e = new L(n.code, n.message);
                        return r(e)
                    }
                    try {
                        const {
                            desc: t
                        } = n;
                        yield this.peerConnection.setRemoteDescription(t), this._removeTracks(e);
                        const r = yield this.peerConnection.createAnswer();
                        yield this.peerConnection.setLocalDescription(r), yield this._callSetAnswer({
                            negotiationId: o,
                            desc: r
                        }), i()
                    } catch (e) {
                        const t = e,
                            i = t.message;
                        r(new V(1446, `????????? ?????? ??????(${i})`, t))
                    }
                }))));
                try {
                    this._callRemoveStream({
                        negotiationId: o,
                        streams: n
                    })
                } catch (e) {
                    r(e)
                }
            }))
        }
        addListeners() {
            this.jsonrpc.on("Room.OnOffer", (e => {
                const {
                    params: t
                } = e;
                this.emitter.emit(t.negotiationId, t)
            })), this.jsonrpc.on("Room.OnError", (e => {
                const {
                    params: t
                } = e;
                t.negotiationId && this.emitter.emit(t.negotiationId, t)
            })), this.jsonrpc.on("Room.OnMessage", (e => {
                const {
                    params: t
                } = e;
                this.emitter.emit(t.type, t.data)
            })), this.jsonrpc.on("Room.OnProfile", (e => {
                const {
                    params: t
                } = e;
                this._replaceVideoProfiles(t.streams)
            }))
        }
        _callAddStream(e) {
            return t(this, void 0, void 0, (function*() {
                const t = yield this.jsonrpc.call("Room.AddStream", e);
                if ("error" in t) throw new L(t.error.code, t.error.message);
                return t
            }))
        }
        _callSetAnswer(e) {
            return t(this, void 0, void 0, (function*() {
                const t = yield this.jsonrpc.call("Room.SetAnswer", e);
                if ("error" in t) throw new L(t.error.code, t.error.message);
                return t
            }))
        }
        _callConfigureStream(e) {
            return t(this, void 0, void 0, (function*() {
                const t = yield this.jsonrpc.call("Room.ConfigureStream", e);
                if ("error" in t) throw new L(t.error.code, t.error.message);
                return t
            }))
        }
        _callRemoveStream(e) {
            return t(this, void 0, void 0, (function*() {
                const t = yield this.jsonrpc.call("Room.RemoveStream", e);
                if ("error" in t) throw new L(t.error.code, t.error.message);
                return t
            }))
        }
        _callSendMessage(e) {
            return t(this, void 0, void 0, (function*() {
                const t = yield this.jsonrpc.call("Room.SendMessage", e);
                if ("error" in t) throw new L(t.error.code, t.error.message);
                return t
            }))
        }
        _replaceAudioTrack(e, i) {
            return t(this, void 0, void 0, (function*() {
                const t = this.peerConnection.getTransceivers().find((t => t.mid === e.mid));
                i && t && (yield t.sender.replaceTrack(i), t.direction = "sendonly")
            }))
        }
        _replaceVideoTrack(e, i) {
            return t(this, void 0, void 0, (function*() {
                const t = this.peerConnection.getTransceivers();
                for (const r of e.profiles) {
                    const e = t.find((e => e.mid === r.mid));
                    if ((null == i ? void 0 : i.getMediaStreamTrack()) && e) {
                        const t = i._getCloneTrack();
                        yield e.sender.replaceTrack(t), e.direction = "sendonly"
                    }
                }
            }))
        }
        _replaceVideoProfiles(e) {
            const t = this.peerConnection.getTransceivers();
            e.forEach((e => {
                e.profiles.forEach((e => {
                    const i = t.find((t => t.mid === e.mid));
                    if (i) {
                        const t = i.sender.getParameters();
                        t.encodings[0].active = e.active, i.sender.setParameters(t), this.activeProfile = e.profile
                    }
                }))
            }))
        }
        _removeTracks(e) {
            const t = this.peerConnection.getTransceivers();
            e.forEach((e => {
                for (const i in this.streamIdMidMap[e]) {
                    const r = this.streamIdMidMap[e][i],
                        o = t.find((e => e.mid === r));
                    o && (this.peerConnection.removeTrack(o.sender), delete this.streamIdMidMap[e][i])
                }
            }))
        }
        _setVideoProfiles(e) {
            var t, i, r, o;
            const n = this.peerConnection.getTransceivers();
            for (const s of e.profiles) {
                const e = n.find((e => e.mid === s.mid));
                if (e) {
                    const n = e.sender.getParameters(),
                        a = s.active,
                        d = Number(s.bitrate),
                        c = "l" === s.profile ? null === (t = this.config.maxFramerate) || void 0 === t ? void 0 : t.l : "m" === s.profile ? null === (i = this.config.maxFramerate) || void 0 === i ? void 0 : i.m : null === (r = this.config.maxFramerate) || void 0 === r ? void 0 : r.h;
                    if ("Safari" === _.getBrowser().name) {
                        const t = null === (o = e.sender.track) || void 0 === o ? void 0 : o.getSettings();
                        if (null == t ? void 0 : t.width) {
                            const e = "l" === s.profile ? t.width / 240 : "m" === s.profile ? t.width / 480 : t.width / 640;
                            n.encodings = [{
                                active: a,
                                maxBitrate: d,
                                maxFramerate: c,
                                scaleResolutionDownBy: e
                            }]
                        }
                    } else n.encodings = [{
                        active: a,
                        maxBitrate: d,
                        maxFramerate: c
                    }];
                    e.sender.setParameters(n), a && (this.activeProfile = s.profile)
                }
            }
        }
        getStats() {
            var e;
            return t(this, void 0, void 0, (function*() {
                const t = this.peerConnection.getTransceivers(),
                    i = [],
                    r = [];
                let o = {};
                for (const n of t) {
                    const t = yield n.sender.getStats(), s = {
                        mid: n.mid,
                        items: []
                    };
                    t.forEach((e => {
                        s.items.push(e), "candidate-pair" === e.type && (o = e)
                    })), "audio" === (null === (e = n.sender.track) || void 0 === e ? void 0 : e.kind) ? i.push(s) : r.push(s)
                }
                const n = [];
                i.forEach((e => {
                    const t = {
                        mid: e.mid,
                        mediaSource: null,
                        outboundRtp: null,
                        track: null
                    };
                    e.items.forEach((e => {
                        "media-source" === e.type ? t.mediaSource = e : "outbound-rtp" === e.type ? t.outboundRtp = e : "track" === e.type && (t.track = e)
                    })), t.mediaSource && t.outboundRtp && t.track && n.push(t)
                }));
                const s = [];
                return r.forEach((e => {
                    const t = {
                        mid: e.mid,
                        mediaSource: null,
                        outboundRtp: null,
                        track: null
                    };
                    e.items.forEach((e => {
                        "media-source" === e.type ? t.mediaSource = e : "outbound-rtp" === e.type ? t.outboundRtp = e : "track" === e.type && (t.track = e)
                    })), t.mediaSource && t.outboundRtp && t.track && s.push(t)
                })), {
                    audioStats: n,
                    videoStats: s,
                    candidatePair: o
                }
            }))
        }
        _setOldAudioStats(e) {
            this.oldAudioStats = e
        }
        _setOldVideoStats(e) {
            this.oldVideoStats = e
        }
        _setOldCandidatePairStats(e) {
            this.oldCandidatePair = e
        }
    }
    e([x("info")], K.prototype, "addStream", null), e([x("info")], K.prototype, "configureStream", null), e([x("info")], K.prototype, "removeStream", null), e([x("info")], K.prototype, "addListeners", null), e([x("debug")], K.prototype, "_callAddStream", null), e([x("debug")], K.prototype, "_callSetAnswer", null), e([x("debug")], K.prototype, "_callConfigureStream", null), e([x("debug")], K.prototype, "_callRemoveStream", null), e([x("debug")], K.prototype, "_callSendMessage", null), e([x("debug")], K.prototype, "_replaceAudioTrack", null), e([x("debug")], K.prototype, "_replaceVideoTrack", null), e([x("debug")], K.prototype, "_replaceVideoProfiles", null), e([x("debug")], K.prototype, "_removeTracks", null), e([x("debug")], K.prototype, "_setVideoProfiles", null);
    class Z {
        constructor(e) {
            this.extraValue = "", this.participantId = "", this.participantId = e
        }
        getParticipantId() {
            return this.participantId
        }
        getExtraValue() {
            return this.extraValue
        }
        _setExtraValue(e = "") {
            this.extraValue = e
        }
        _setParticipantId(e) {
            this.participantId = e
        }
    }
    e([x("info")], Z.prototype, "getParticipantId", null), e([x("info")], Z.prototype, "getExtraValue", null), e([x("info")], Z.prototype, "_setExtraValue", null), e([x("debug")], Z.prototype, "_setParticipantId", null);
    class X extends Z {
        constructor(e, t) {
            super(t.id), this.type = "none", this.extraValue = "", this.videoId = -1, this.receiverId = "", this.paused = !1, this.active = !0, this.profile = "l", this.statusUpdateFn = () => Promise.resolve(), this.videoId = e.streamId, this.videoElements = [], this.type = e.type, this.extraValue = e.extraValue || ""
        }
        get isEnabled() {
            var e;
            return null === (e = this.mediaStreamTrack) || void 0 === e ? void 0 : e.enabled
        }
        _setType(e) {
            this.type = e
        }
        _setRemoteTrack(e) {
            this.mediaStreamTrack = e
        }
        attach(e) {
            if (!this.mediaStreamTrack) return;
            let t;
            t = e || document.createElement("video");
            const i = this.getMediaStream();
            return t.srcObject = i || null, t.autoplay = !0, t.playsInline = !0, this.videoElements.push(t), t
        }
        detach() {
            this.videoElements.forEach((e => e.remove())), this.videoElements = []
        }
        getMediaStreamTrack() {
            return this.mediaStreamTrack
        }
        getMediaStream() {
            if (this.mediaStreamTrack) return new MediaStream([this.mediaStreamTrack])
        }
        getVideoId() {
            return this.videoId
        }
        _setVideoId(e) {
            this.videoId = e
        }
        _setReceiverId(e, t) {
            this.receiverId = e, this.statusUpdateFn = t
        }
        _setActive(e) {
            this.active = e
        }
        setPaused(e) {
            return t(this, void 0, void 0, (function*() {
                this.mediaStreamTrack && (e = "boolean" != typeof e || e, this.paused = e, e !== this.mediaStreamTrack.enabled && (this.mediaStreamTrack.enabled = e, yield this.statusUpdateFn({
                    receiverId: this.receiverId,
                    pause: e
                })))
            }))
        }
        setQuality(e) {
            return t(this, void 0, void 0, (function*() {
                if ("l" !== e && "m" !== e && "h" !== e) throw new V(1207, "????????? ?????? ?????? ????????? 'l', 'm', ''h ??? ???????????? ?????????.");
                e && (this.profile = e, yield this.statusUpdateFn({
                    receiverId: this.receiverId,
                    profile: e
                }))
            }))
        }
    }
    e([x("info")], X.prototype, "_setType", null), e([x("info")], X.prototype, "_setRemoteTrack", null), e([x("info")], X.prototype, "attach", null), e([x("info")], X.prototype, "detach", null), e([x("info")], X.prototype, "getMediaStreamTrack", null), e([x("info")], X.prototype, "getMediaStream", null), e([x("info")], X.prototype, "getVideoId", null), e([x("info")], X.prototype, "_setVideoId", null), e([x("debug")], X.prototype, "_setReceiverId", null), e([x("info")], X.prototype, "_setActive", null), e([x("info")], X.prototype, "setPaused", null), e([x("info")], X.prototype, "setQuality", null);
    class Y extends Z {
        constructor(e, t) {
            super(t.id), this.type = "none", this.extraValue = "", this.audioId = -1, this.receiverId = "", this.active = !0, this.audioId = e.streamId, this.type = e.type, this.extraValue = e.extraValue, this.isAlwaysOn = e.property.alwaysOn, this.active = e.property.active
        }
        getAudioId() {
            return this.audioId
        }
        _setReceiverId(e) {
            this.receiverId = e
        }
        _setAlwaysOn(e) {
            this.isAlwaysOn = e
        }
        _setActive(e) {
            this.active = e
        }
    }
    e([x("info")], Y.prototype, "getAudioId", null), e([x("debug")], Y.prototype, "_setReceiverId", null), e([x("info")], Y.prototype, "_setAlwaysOn", null), e([x("info")], Y.prototype, "_setActive", null);
    class ee {
        constructor(e, t, i = []) {
            this.streamIdMap = {}, this.audioMap = {}, this.videoMap = {}, this.id = e, this.getTrackFn = t, this.streamIdMap = i.reduce(((e, t) => (e[t.streamId] = t, "video" === t.media ? this.videoMap[t.streamId] = new X(t, this) : "audio" === t.media && (this.audioMap[t.streamId] = new Y(t, this)), e)), {})
        }
        get hasAudio() {
            return z(this.streamIdMap, (e => "audio" === e.media))
        }
        get hasVideo() {
            return z(this.streamIdMap, (e => "video" === e.media))
        }
        get audios() {
            return W(this.audioMap)
        }
        get videos() {
            return W(this.videoMap)
        }
        get isEnabledVideo() {
            return z(this.streamIdMap, (e => "video" === e.media && e.property.active))
        }
        get isEnabledAudio() {
            return z(this.streamIdMap, (e => "audio" === e.media && e.property.active))
        }
        _getSubscribedStreamIds() {
            return this._getFilterStreamIds().assigned
        }
        _getUnsubscribedStreamIds() {
            return this._getFilterStreamIds().notAssigned
        }
        getSubscribedVideos() {
            return this._getFilterStreams().assigned.map((e => this.videoMap[e.streamId]))
        }
        getUnsubscribedVideos() {
            return this._getFilterStreams().notAssigned.map((e => this.videoMap[e.streamId]))
        }
        getAudio(e) {
            return this.audioMap[e]
        }
        getVideo(e) {
            return this.videoMap[e]
        }
        _getVideoStreamIdAll() {
            return Q(this.streamIdMap, (e => "video" === e.media)).map((e => e.streamId))
        }
        _getVideoStreamAll() {
            return Q(this.streamIdMap, (e => "video" === e.media))
        }
        _getFilterStreamIds() {
            const e = this._getVideoStreamIdAll(),
                t = e.map((e => this.getTrackFn(e)));
            return {
                assigned: e.filter(((e, i) => !!t[i])),
                notAssigned: e.filter(((e, i) => !t[i]))
            }
        }
        _getFilterStreams() {
            const e = this._getVideoStreamAll(),
                t = e.map((e => this.getTrackFn(e.streamId)));
            return {
                assigned: e.filter(((e, i) => !!t[i])),
                notAssigned: e.filter(((e, i) => !t[i]))
            }
        }
        _addStream(e) {
            this.streamIdMap[e.streamId] = e, "video" === e.media ? this.videoMap[e.streamId] = new X(e, this) : "audio" === e.media && (this.audioMap[e.streamId] = new Y(e, this))
        }
        _updateStream({
                          streamId: e,
                          property: t
                      }) {
            const i = Object.assign(Object.assign({}, this.streamIdMap[e]), {
                property: t
            });
            this.streamIdMap[e] = i
        }
        _removeStream(e) {
            delete this.streamIdMap[e], delete this.videoMap[e], delete this.audioMap[e]
        }
    }
    e([x("debug")], ee.prototype, "_getSubscribedStreamIds", null), e([x("debug")], ee.prototype, "_getUnsubscribedStreamIds", null), e([x("info")], ee.prototype, "getSubscribedVideos", null), e([x("info")], ee.prototype, "getUnsubscribedVideos", null), e([x("debug")], ee.prototype, "getAudio", null), e([x("debug")], ee.prototype, "getVideo", null), e([x("debug")], ee.prototype, "_getVideoStreamIdAll", null), e([x("debug")], ee.prototype, "_getVideoStreamAll", null), e([x("debug")], ee.prototype, "_getFilterStreamIds", null), e([x("debug")], ee.prototype, "_getFilterStreams", null), e([x("debug")], ee.prototype, "_addStream", null), e([x("debug")], ee.prototype, "_updateStream", null), e([x("debug")], ee.prototype, "_removeStream", null);
    class te {
        constructor() {
            this.id = "", this.audioMap = {}, this.videoMap = {}
        }
        get hasAudio() {
            return W(this.audioMap).length > 0
        }
        get hasVideo() {
            return W(this.videoMap).length > 0
        }
        _setLocalAudio(e) {
            this.audioMap[e.streamId] = e
        }
        _setLocalVideo(e) {
            this.videoMap[e.streamId] = e
        }
        getAudio(e) {
            return this.audioMap[e] || null
        }
        getVideo(e) {
            return this.videoMap[e] || null
        }
        _setLocalParticipantId(e) {
            this.id = e
        }
        stop() {
            W(this.audioMap).forEach((e => e.stop())), W(this.videoMap).forEach((e => e.stop()))
        }
        _removeStream(e) {
            delete this.audioMap[e], delete this.videoMap[e]
        }
    }
    e([x("info")], te.prototype, "_setLocalAudio", null), e([x("info")], te.prototype, "_setLocalVideo", null), e([x("info")], te.prototype, "getAudio", null), e([x("info")], te.prototype, "getVideo", null), e([x("info")], te.prototype, "_setLocalParticipantId", null), e([x("info")], te.prototype, "stop", null), e([x("debug")], te.prototype, "_removeStream", null);
    class ie {
        constructor(e, t) {
            this.streamId = -1, this.statusUpdateFn = () => Promise.resolve(), this.mediaStreamTrack = e, this.extraValue = t
        }
        get isEnabled() {
            return this.mediaStreamTrack.enabled
        }
        get kind() {
            return this.mediaStreamTrack.kind
        }
        getMediaStreamTrack() {
            return this.mediaStreamTrack
        }
        getMediaStream() {
            return new MediaStream([this.mediaStreamTrack])
        }
        getStreamId() {
            return this.streamId
        }
        getExtraValue() {
            return this.extraValue
        }
        setExtraValue(e) {
            this.extraValue = e
        }
        setEnabled(e) {
            return t(this, void 0, void 0, (function*() {
                (e = "boolean" != typeof e || e) !== this.mediaStreamTrack.enabled && (this.mediaStreamTrack.enabled = e, yield this.statusUpdateFn({
                    streamId: this.streamId,
                    active: e
                }))
            }))
        }
        _setStreamId(e, t) {
            this.streamId = e, this.statusUpdateFn = t
        }
    }
    e([x("debug")], ie.prototype, "getMediaStreamTrack", null), e([x("debug")], ie.prototype, "getMediaStream", null), e([x("info")], ie.prototype, "getStreamId", null), e([x("info")], ie.prototype, "getExtraValue", null), e([x("info")], ie.prototype, "setExtraValue", null), e([x("info")], ie.prototype, "setEnabled", null);
    class re extends ie {
        constructor(e, t, i) {
            super(e, i), this.hd = !1, this.type = t, this.videoElements = [], this.cloneMediaStreamTracks = []
        }
        attach(e) {
            if (!this.mediaStreamTrack) return;
            let t;
            t = e || document.createElement("video");
            const i = this.getMediaStream();
            return t.srcObject = i || null, t.autoplay = !0, t.playsInline = !0, this.videoElements.push(t), t
        }
        detach() {
            this.videoElements.forEach((e => e.remove())), this.videoElements = []
        }
        stop() {
            this.mediaStreamTrack.stop(), this.cloneMediaStreamTracks.forEach((e => e.stop())), this.cloneMediaStreamTracks = []
        }
        setHd(e) {
            this.hd = e
        }
        _getCloneTrack() {
            const e = this.getMediaStreamTrack().clone();
            return this.cloneMediaStreamTracks.push(e), e
        }
    }
    e([x("debug")], re.prototype, "attach", null), e([x("debug")], re.prototype, "detach", null), e([x("info")], re.prototype, "stop", null), e([x("info")], re.prototype, "setHd", null), e([x("debug")], re.prototype, "_getCloneTrack", null);
    class oe extends ie {
        constructor(e, t, i) {
            super(e, i), this.isAlwaysOn = !1, this.type = t
        }
        stop() {
            this.mediaStreamTrack.stop()
        }
        setAlwaysOn(e) {
            return t(this, void 0, void 0, (function*() {
                this.isAlwaysOn = "boolean" != typeof e || e, yield this.statusUpdateFn({
                    streamId: this.streamId,
                    alwaysOn: this.isAlwaysOn
                })
            }))
        }
    }
    e([x("info")], oe.prototype, "stop", null), e([x("info")], oe.prototype, "setAlwaysOn", null);
    class ne {
        constructor(e = {}) {
            this.room = null, this.audio = void 0, this.video = void 0, e.video && !0 === e.video && (e.video = {}), e.audio && !0 === e.audio && (e.audio = {}), this.constraints = e
        }
        getDevices() {
            return t(this, void 0, void 0, (function*() {
                return yield navigator.mediaDevices.enumerateDevices()
            }))
        }
        getMicDevices() {
            return t(this, void 0, void 0, (function*() {
                return (yield this.getDevices()).filter((e => "audioinput" === e.kind && e.deviceId))
            }))
        }
        getSpeakerDevices() {
            return t(this, void 0, void 0, (function*() {
                return (yield this.getDevices()).filter((e => "audiooutput" === e.kind && e.deviceId))
            }))
        }
        getCameraDevices() {
            return t(this, void 0, void 0, (function*() {
                return (yield this.getDevices()).filter((e => "videoinput" === e.kind && e.deviceId))
            }))
        }
        switchCamera(e) {
            return t(this, void 0, void 0, (function*() {
                if (this.constraints && this.constraints.video) {
                    let t;
                    this.constraints.video = Object.assign(this.constraints.video, {
                        deviceId: {
                            exact: e
                        }
                    }), this.room && this.video && (this.video.stop(), yield this.room.unpublish([this.video]));
                    try {
                        t = yield navigator.mediaDevices.getUserMedia({
                            video: this.constraints.video,
                            audio: !1
                        })
                    } catch (e) {
                        const t = e,
                            i = t.message;
                        throw P.error("Failed to switchCamera. ", t.name, i), new V(1203, `getUserMedia ??????(${i})`, t)
                    }
                    const [i] = t.getVideoTracks();
                    if (i) {
                        if ("ended" === i.readyState) throw new V(1206, "????????? ????????? ??????????????? ?????? ???????????????.");
                        this.video = new re(i, "multiple"), P.debug("switch video track", "id=" + i.id, "label=" + i.label, "enabled=" + i.enabled, "kind=" + i.kind, "muted=" + i.muted, "readyState=" + i.readyState), this.room && (yield this.room.publish([this.video]))
                    }
                }
            }))
        }
        switchMic(e) {
            return t(this, void 0, void 0, (function*() {
                if (this.constraints && this.constraints.audio) {
                    let t;
                    this.constraints.audio = Object.assign(this.constraints.audio, {
                        deviceId: {
                            exact: e
                        }
                    }), this.room && this.audio && (this.audio.stop(), yield this.room.unpublish([this.audio]));
                    try {
                        t = yield navigator.mediaDevices.getUserMedia({
                            video: !1,
                            audio: this.constraints.audio
                        })
                    } catch (e) {
                        const t = e,
                            i = t.message;
                        throw P.error("Failed to switchMic. ", t.name, i), new V(1203, `getUserMedia ??????(${i})`, t)
                    }
                    const [i] = t.getAudioTracks();
                    if (i) {
                        if ("ended" === i.readyState) throw new V(1205, "????????? ????????? ??????????????? ?????? ???????????????.");
                        this.audio = new oe(i, "single"), P.debug("switch audio track", "id=" + i.id, "label=" + i.label, "enabled=" + i.enabled, "kind=" + i.kind, "muted=" + i.muted, "readyState=" + i.readyState), this.room && (yield this.room.publish([this.audio]))
                    }
                }
            }))
        }
        _getUserMedia() {
            return t(this, void 0, void 0, (function*() {
                this.stop();
                try {
                    const e = yield navigator.mediaDevices.getUserMedia(this.constraints), [t] = e.getAudioTracks(), [i] = e.getVideoTracks();
                    if (P.debug("got mediaStream", "id=" + e.id, "active=" + e.active), t && (P.debug("got audio track", "id=" + t.id, "label=" + t.label, "enabled=" + t.enabled, "kind=" + t.kind, "muted=" + t.muted, "readyState=" + t.readyState), "ended" === t.readyState)) throw new V(1205, "????????? ????????? ??????????????? ?????? ???????????????.");
                    if (i && (P.debug("got video track", "id=" + i.id, "label=" + i.label, "enabled=" + i.enabled, "kind=" + i.kind, "muted=" + i.muted, "readyState=" + i.readyState), "ended" === i.readyState)) throw new V(1206, "????????? ????????? ??????????????? ?????? ???????????????.");
                    this.audio = t ? new oe(t, "single") : void 0, this.video = i ? new re(i, "multiple") : void 0
                } catch (e) {
                    const t = e,
                        i = t.message;
                    throw P.error("Failed to getUserMedia. ", t.name, i), new V(1203, `getUserMedia ??????(${i})`, t)
                }
            }))
        }
        stop() {
            var e, t;
            null === (e = this.audio) || void 0 === e || e.stop(), null === (t = this.video) || void 0 === t || t.stop()
        }
        _setRoom(e) {
            this.room = e
        }
        setMediaStream(e) {
            const [t] = e.getAudioTracks(), [i] = e.getVideoTracks();
            this.audio = t ? new oe(t, "single") : void 0, this.video = i ? new re(i, "multiple") : void 0, t && P.debug("set media stream track", "id=" + t.id, "label=" + t.label, "enabled=" + t.enabled, "kind=" + t.kind, "muted=" + t.muted, "readyState=" + t.readyState), i && P.debug("set media stream track", "id=" + i.id, "label=" + i.label, "enabled=" + i.enabled, "kind=" + i.kind, "muted=" + i.muted, "readyState=" + i.readyState)
        }
    }
    e([x("debug")], ne.prototype, "getDevices", null), e([x("debug")], ne.prototype, "getMicDevices", null), e([x("debug")], ne.prototype, "getSpeakerDevices", null), e([x("debug")], ne.prototype, "getCameraDevices", null), e([x("info")], ne.prototype, "switchCamera", null), e([x("info")], ne.prototype, "switchMic", null), e([x("info")], ne.prototype, "_getUserMedia", null), e([x("info")], ne.prototype, "stop", null), e([x("info")], ne.prototype, "setMediaStream", null);
    class se {
        constructor() {
            this.audioReceivers = [], this.audioElements = []
        }
        _setReceivers(e) {
            this.audioReceivers = e
        }
        attach() {
            const e = this.audioReceivers.map((e => {
                const t = document.createElement("audio");
                return t.srcObject = this._getMediaStream(e), t.autoplay = !0, t
            }));
            return this.audioElements = this.audioElements.concat(e), this.audioElements
        }
        detach() {
            this.audioElements.forEach((e => e.remove())), this.audioElements = []
        }
        _getMediaStream(e) {
            const t = new MediaStream;
            return t.addTrack(e.track), t
        }
        stop() {
            this.audioReceivers.forEach((e => e.track.stop()))
        }
    }
    e([x("debug")], se.prototype, "_setReceivers", null), e([x("debug")], se.prototype, "attach", null), e([x("debug")], se.prototype, "detach", null), e([x("debug")], se.prototype, "_getMediaStream", null), e([x("info")], se.prototype, "stop", null);
    class ae {
        constructor(e = {}) {
            this.room = null, this.audio = void 0, this.video = void 0, e.video && !0 === e.video && (e.video = {}), e.audio && !0 === e.audio && (e.audio = {}), this.constraints = e
        }
        switchDisplay() {
            return t(this, void 0, void 0, (function*() {
                this.constraints && this.constraints.video && (this.room && this.video && (yield this.room.unpublish([this])), yield this._getDisplayMedia(), this.room && this.video && this.room.publish([this]))
            }))
        }
        _getDisplayMedia() {
            var e;
            return t(this, void 0, void 0, (function*() {
                this.stop();
                try {
                    const t = yield navigator.mediaDevices.getDisplayMedia(this.constraints), [i] = t.getAudioTracks(), [r] = t.getVideoTracks();
                    if (this.audio = i ? new oe(i, "single") : void 0, this.video = r ? new re(r, "single") : void 0, P.debug("got display stream", "id=" + t.id, "active=" + t.active), i && (P.debug("got display audio track", "id=" + i.id, "label=" + i.label, "enabled=" + i.enabled, "kind=" + i.kind, "muted=" + i.muted, "readyState=" + i.readyState), "ended" === i.readyState)) throw new V(1205, "????????? ????????? ??????????????? ?????? ???????????????.");
                    if (r && (P.debug("got display video track", "id=" + r.id, "label=" + r.label, "enabled=" + r.enabled, "kind=" + r.kind, "muted=" + r.muted, "readyState=" + r.readyState), "ended" === r.readyState)) throw new V(1205, "????????? ????????? ??????????????? ?????? ???????????????.");
                    null === (e = this.video) || void 0 === e || e.setHd(!0), i && P.debug("got display media track", "id=" + i.id, "label=" + i.label, "enabled=" + i.enabled, "kind=" + i.kind, "muted=" + i.muted, "readyState=" + i.readyState), r && P.debug("got display media track", "id=" + r.id, "label=" + r.label, "enabled=" + r.enabled, "kind=" + r.kind, "muted=" + r.muted, "readyState=" + r.readyState)
                } catch (e) {
                    const t = e,
                        i = t.message;
                    throw P.error("Failed to getDisplayMedia. ", t.name, i), new V(1204, `getDisplayMedia ??????(${i})`, t)
                }
            }))
        }
        stop() {
            var e, t;
            null === (e = this.audio) || void 0 === e || e.stop(), null === (t = this.video) || void 0 === t || t.stop()
        }
        _setRoom(e) {
            this.room = e
        }
    }
    var de;
    e([x("debug")], ae.prototype, "switchDisplay", null), e([x("info")], ae.prototype, "_getDisplayMedia", null), e([x("info")], ae.prototype, "stop", null),
        function(e) {
            e.CONNECTING = "connecting", e.CONNECTED = "connected", e.DISCONNECTED = "disconnected", e.PARTICIPANTENTERED = "participantEntered", e.PARTICIPANTLEFT = "participantLeft", e.LOCALVIDEOPUBLISHED = "localVideoPublished", e.LOCALVIDEOUNPUBLISHED = "localVideoUnpublished", e.LOCALAUDIOPUBLISHED = "localAudioPublished", e.LOCALAUDIOUNPUBLISHED = "localAudioUnpublished", e.REMOTEVIDEOPUBLISHED = "remoteVideoPublished", e.REMOTEVIDEOUNPUBLISHED = "remoteVideoUnpublished", e.REMOTEAUDIOPUBLISHED = "remoteAudioPublished", e.REMOTEAUDIOUNPUBLISHED = "remoteAudioUnpublished", e.REMOTEAUDIOLEVELUPDATED = "remoteAudioLevelUpdated", e.REMOTEAUDIOSUBSCRIBED = "remoteAudioSubscribed", e.REMOTEAUDIOUNSUBSCRIBED = "remoteAudioUnsubscribed", e.REMOTEVIDEOSTATECHANGED = "remoteVideoStateChanged", e.REMOTEAUDIOSTATECHANGED = "remoteAudioStateChanged", e.ERROR = "error", e.RECORDFAILED = "recordFailed", e.USERMESSAGE = "userMessage", e.STAT = "stat"
        }(de || (de = {}));
    const ce = 1,
        le = 2,
        ue = 3,
        he = 3;
    class pe extends $ {
        constructor(e, t, i = {}) {
            super(), this.participantMap = {}, this.receiverMap = {}, this.audioStreamIdMap = {}, this.config = {
                videoReceiverInitialCount: 10,
                videoReceiverGrowthRate: 5,
                videoReceiverMaximumCount: 50,
                cpuOveruseDetection: !0,
                maxFramerate: {
                    l: 10,
                    m: 20,
                    h: 30
                },
                voiceMode: !0,
                statInterval: 5e3
            }, this.audioOccupants = {}, this.audioLvlUpdateTs = 0, this.subscribeStreamIdsQueue = [], this.unsubscribeStreamIdsQueue = [], this.streamIdsQueueInterval = -1, this.isStreamIdsQueueWorking = !1, this.qualityMetricInterval = -1, Object.assign(this.config, i), P.debug(this.config), this.roomApiClient = new F, this.upSession = new K(this.roomApiClient, {
                cpuOveruseDetection: this.config.cpuOveruseDetection,
                maxFramerate: this.config.maxFramerate,
                voiceMode: this.config.voiceMode
            }), this.downSession = new J(this.roomApiClient, {
                cpuOveruseDetection: this.config.cpuOveruseDetection,
                voiceMode: this.config.voiceMode
            }), this.localParticipant = new te, this.remoteAudioElements = new se, this.authConfig = e, this.authResponse = t, this.roomStatus = "created", this.roomApiClient.on("error", (e => {
                this._dispatch(de.ERROR, e)
            })), this.upSession.on("error", (e => {
                this._dispatch(de.ERROR, e)
            })), this.upSession.on("RecordFailed", (e => {
                this._dispatch(de.RECORDFAILED, e)
            })), this.downSession.on("error", (e => {
                this._dispatch(de.ERROR, e)
            })), this._handleParticipantsInfo(), this._handleReceivers();
            const r = this.authResponse.api,
                o = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${this.authResponse.token}`
                    }
                };
            this.roomApiClient.setHost(r), this.roomApiClient.setHeaders(o), this.roomStatus = "initiated"
        }
        get remoteParticipants() {
            return Q(this.participantMap, (e => e.id !== this.localParticipant.id))
        }
        connect(e) {
            return t(this, void 0, void 0, (function*() {
                if (!/^[a-zA-Z0-9-]+$/.test(e) || e.length > 32) throw new V(1301, "????????? ??? id??? ???????????? ?????? ??????, ????????? ???????????????.(32??? ??????, ?????????/??????/- ??? ??????)");
                this.roomApiClient.setRoomId(e);
                const i = yield this.roomApiClient.sendEnterRoom();
                this.roomApiClient.setParticipantId(i.result.participantId), this.localParticipant._setLocalParticipantId(i.result.participantId), this._dispatch(de.CONNECTING, {
                    progress: ce / he * 100
                });
                const r = this.authResponse.iceServers;
                yield this.upSession.create({
                    iceServers: r
                }), this._dispatch(de.CONNECTING, {
                    progress: le / he * 100
                }), yield this.downSession.create({
                    iceServers: r
                }), this._dispatch(de.CONNECTING, {
                    progress: ue / he * 100
                }), this.roomStatus = "connected", this.streamIdsQueueInterval = window.setInterval((() => t(this, void 0, void 0, (function*() {
                    if (!1 === this.isStreamIdsQueueWorking)
                        if (this.unsubscribeStreamIdsQueue.length) {
                            const e = this.unsubscribeStreamIdsQueue.shift();
                            if (e) {
                                this.isStreamIdsQueueWorking = !0;
                                const t = e.pairs;
                                try {
                                    yield this.downSession.assignStream(t);
                                    let i = [];
                                    t.forEach((({
                                                    receiverId: e
                                                }) => {
                                        this.remoteParticipants.forEach((t => {
                                            const r = t.videos.find((t => t.receiverId === e));
                                            r && (r._setReceiverId(""), r._setRemoteTrack(null), i.push(r))
                                        })), this.receiverMap[e].streamId = null
                                    })), this.emit(e.key, i)
                                } catch (t) {
                                    this.emit(e.key, t)
                                }
                                this.isStreamIdsQueueWorking = !1
                            }
                        } else if (this.subscribeStreamIdsQueue.length) {
                            const e = this.subscribeStreamIdsQueue.shift();
                            if (e) {
                                this.isStreamIdsQueueWorking = !0;
                                let t = [];
                                try {
                                    for (let i of e.streamIds) {
                                        const e = yield this._assignVideoStream([i]);
                                        e && (t = [...t, ...e])
                                    }
                                    this.emit(e.key, t)
                                } catch (t) {
                                    this.emit(e.key, t)
                                }
                                this.isStreamIdsQueueWorking = !1
                            }
                        }
                }))), 100), this._startQualityMetricReport(e)
            }))
        }
        disconnect(e = "disconnected") {
            return t(this, void 0, void 0, (function*() {
                if ("connected" !== this.roomStatus) return P.error("not connected.");
                window.clearInterval(this.streamIdsQueueInterval), this.streamIdsQueueInterval = -1, window.clearInterval(this.qualityMetricInterval), this.qualityMetricInterval = -1, this.isStreamIdsQueueWorking = !1, this.unsubscribeStreamIdsQueue = [], this.subscribeStreamIdsQueue = [], this.participantMap = {}, this.receiverMap = {}, this.audioStreamIdMap = {}, this.audioOccupants = {}, this.audioLvlUpdateTs = 0, this.remoteAudioElements.detach(), this.remoteAudioElements.stop(), this.downSession.getTracks().forEach((e => e.stop())), "disconnected" === e ? (yield this.upSession.destroy(), yield this.downSession.destroy()) : (this.upSession.close(), this.downSession.close()), this.roomStatus = e, this._dispatch(de.DISCONNECTED, e)
            }))
        }
        publish(e, i = !1) {
            return t(this, void 0, void 0, (function*() {
                if (e.length < 1) throw new V(1324, "??? ????????? ?????????????????????.");
                const r = e => {
                        let r, o;
                        return e instanceof ne || e instanceof ae ? (r = e.audio, o = e.video) : e instanceof oe ? r = e : e instanceof re && (o = e), new Promise(((n, s) => t(this, void 0, void 0, (function*() {
                            try {
                                const {
                                    audioOffer: s,
                                    videoOffer: a
                                } = yield this.upSession.addStream({
                                    audioType: r ? r.type : "none",
                                    audioTrack: null == r ? void 0 : r.getMediaStreamTrack(),
                                    audioExtraValue: null == r ? void 0 : r.extraValue,
                                    videoType: o ? o.type : "none",
                                    localVideo: o || void 0,
                                    videoExtraValue: null == o ? void 0 : o.extraValue,
                                    videoHd: null == o ? void 0 : o.hd,
                                    record: i
                                });
                                e instanceof ne && e._setRoom(this), s && r && (r._setStreamId(s.streamId, (e => t(this, void 0, void 0, (function*() {
                                    yield this.upSession.configureStream([e])
                                })))), this.localParticipant._setLocalAudio(r), this._dispatch(de.LOCALAUDIOPUBLISHED, {
                                    localAudio: r
                                })), a && o && (o._setStreamId(a.streamId, (e => t(this, void 0, void 0, (function*() {
                                    yield this.upSession.configureStream([e])
                                })))), this.localParticipant._setLocalVideo(o), this._dispatch(de.LOCALVIDEOPUBLISHED, {
                                    localVideo: o
                                })), n(e)
                            } catch (e) {
                                s(e)
                            }
                        }))))
                    },
                    o = e.map((e => r(e)));
                try {
                    yield Promise.all(o)
                } catch (e) {
                    throw e
                }
            }))
        }
        unpublish(e) {
            return t(this, void 0, void 0, (function*() {
                const t = [];
                e.forEach((e => {
                    e instanceof ne || e instanceof ae ? (e.audio && t.push(e.audio.getStreamId()), e.video && t.push(e.video.getStreamId())) : t.push(e.getStreamId())
                }));
                try {
                    yield this.upSession.removeStream(t)
                } catch (e) {
                    throw e
                }
            }))
        }
        subscribe(e) {
            return new Promise(((t, i) => {
                let r = [];
                r = Array.isArray(e) ? e : e._getUnsubscribedStreamIds();
                const o = this._checkAlreadySubscribe(r);
                if (o.length) return i(new V(1321, "?????? ?????? ?????? ??????????????????. " + o));
                const n = Math.random().toString(36).substring(2, 12);
                this.subscribeStreamIdsQueue.push({
                    key: n,
                    streamIds: r
                }), this.once(n, (e => {
                    if (e instanceof Error) return i(e);
                    e.forEach((e => {
                        e.setQuality("m")
                    })), t(e)
                }))
            }))
        }
        unsubscribe(e) {
            return t(this, void 0, void 0, (function*() {
                return new Promise(((t, i) => {
                    const r = e instanceof ee ? e._getSubscribedStreamIds() : e,
                        o = Object.entries(this.receiverMap).reduce(((e, [t, {
                            type: i,
                            streamId: r
                        }]) => (r && (e[r] = {
                            type: i,
                            receiverId: t
                        }), e)), {}),
                        n = [];
                    r.forEach((e => {
                        o[e] && n.push(o[e].receiverId)
                    }));
                    const s = n.map((e => ({
                            receiverId: e,
                            streamId: 0
                        }))),
                        a = Math.random().toString(36).substring(2, 12);
                    this.unsubscribeStreamIdsQueue.push({
                        key: a,
                        pairs: s
                    }), this.once(a, (e => {
                        if (e instanceof Error) return i(e);
                        t(e)
                    }))
                }))
            }))
        }
        getParticipant(e) {
            return this.participantMap[e] || null
        }
        getAudioOccupants() {
            return W(this.audioOccupants)
        }
        getRemoteVideo(e) {
            let t = null;
            return this.remoteParticipants.some((i => {
                if (t = i.videos.find((t => {
                    if (t.videoId === e) return !0
                })), t) return !0
            })), t
        }
        getRemoteAudio(e) {
            let t = null;
            return this.remoteParticipants.some((i => {
                if (t = i.audios.find((t => {
                    if (t.audioId === e) return !0
                })), t) return !0
            })), t
        }
        _checkAlreadySubscribe(e) {
            return Object.values(this.receiverMap).filter((({
                                                                type: e,
                                                                streamId: t
                                                            }) => "video" === e && null !== t)).map((e => e.streamId)).filter((t => {
                if (t) return e.includes(t)
            }))
        }
        _checkMaxReceiverCount() {
            return this._getCurrentReceiverCount() >= this.config.videoReceiverMaximumCount
        }
        _getCurrentReceiverCount() {
            const e = {};
            Object.entries(this.receiverMap).forEach((([t, i]) => {
                i.streamId && (e[t] = i)
            }));
            return Object.keys(e).filter((e => {
                var t;
                return "video" === (null === (t = this.downSession.getTrack(e)) || void 0 === t ? void 0 : t.kind)
            })).length
        }
        _setReceiverPool(e) {
            return t(this, void 0, void 0, (function*() {
                if (this._checkMaxReceiverCount()) throw new V(1322, "????????? ????????? maxReceiverCount??? ????????? ??? ????????????.");
                var t, i;
                yield this.downSession.addReceiver((t = e, i = {
                    type: "video"
                }, new Array(t).fill(i)))
            }))
        }
        _assignVideoStream(e) {
            return t(this, void 0, void 0, (function*() {
                if (0 === e.length) throw new V(1323, "??? streamIds??? ?????????????????????.");
                if (this._checkMaxReceiverCount()) throw new V(1322, "????????? ????????? maxReceiverCount??? ????????? ??? ????????????.");
                const i = this._checkAlreadySubscribe(e);
                if (i.length) throw new V(1321, "?????? ?????? ?????? ??????????????????. " + i);
                const r = Object.entries(this.receiverMap).filter((([e, {
                    type: t,
                    streamId: i
                }]) => "video" === t && null === i)).map((([e]) => e)).slice(0, e.length);
                if (0 === r.length || e.length > r.length) {
                    let t = this.config.videoReceiverGrowthRate;
                    const i = this._getCurrentReceiverCount();
                    if (i + this.config.videoReceiverGrowthRate > this.config.videoReceiverMaximumCount && (t = this.config.videoReceiverMaximumCount - i), t > 0) return yield this._setReceiverPool(t), yield this._assignVideoStream(e)
                } else {
                    const i = e.map(((e, t) => ({
                        streamId: e,
                        receiverId: r[t]
                    })));
                    i.forEach((({
                                    streamId: e,
                                    receiverId: t
                                }) => {
                        const i = Object.assign(Object.assign({}, this.receiverMap[t]), {
                            streamId: e
                        });
                        this.receiverMap[t] = i
                    }));
                    try {
                        yield this.downSession.assignStream(i);
                        let e = [];
                        return i.forEach((({
                                               streamId: i,
                                               receiverId: r
                                           }) => {
                            const o = this.downSession.getTrack(r);
                            if (o) {
                                const n = Object.values(this.participantMap).find((e => !!e.streamIdMap[i]));
                                if (n) {
                                    const s = n.getVideo(i);
                                    s._setReceiverId(r, (e => t(this, void 0, void 0, (function*() {
                                        yield this.downSession.configureReceiver([e])
                                    })))), s._setRemoteTrack(o), e.push(s)
                                }
                            }
                        })), e
                    } catch (e) {
                        throw i.forEach((({
                                              receiverId: e
                                          }) => {
                            this.receiverMap[e].streamId = null
                        })), e
                    }
                }
            }))
        }
        _handleParticipantsInfo() {
            const e = e => {
                for (const t in this.receiverMap)
                    if (this.receiverMap[t].streamId === e) {
                        return this.downSession.getTrack(t)
                    }
            };
            this.downSession.on("ChangedParticipantsInfo", (({
                                                                 change: t
                                                             }) => {
                if (t.fullData && t.fullData.forEach((({
                                                           participantId: t,
                                                           streams: i
                                                       }) => {
                    t !== this.localParticipant.id && (this.participantMap[t] = new ee(t, e, i), null == i || i.filter((e => {
                        "audio" === e.media && (this.audioStreamIdMap[e.streamId.toString()] = t)
                    })))
                })), t.participantsEnter && (t.participantsEnter.forEach((t => {
                    t !== this.localParticipant.id && (this.participantMap[t] = new ee(t, e))
                })), t.participantsEnter.forEach((e => {
                    if (e !== this.localParticipant.id) return this._dispatch(de.PARTICIPANTENTERED, {
                        remoteParticipant: this.participantMap[e]
                    })
                }))), t.participantsLeave && t.participantsLeave.forEach((e => {
                    if (e !== this.localParticipant.id) return delete this.participantMap[e], this._dispatch(de.PARTICIPANTLEFT, {
                        remoteParticipantId: e
                    })
                })), t.streamsAdded) {
                    t.streamsAdded.forEach((e => {
                        var t, {
                                participantId: i
                            } = e,
                            r = function(e, t) {
                                var i = {};
                                for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (i[r] = e[r]);
                                if (null != e && "function" == typeof Object.getOwnPropertySymbols) {
                                    var o = 0;
                                    for (r = Object.getOwnPropertySymbols(e); o < r.length; o++) t.indexOf(r[o]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[o]) && (i[r[o]] = e[r[o]])
                                }
                                return i
                            }(e, ["participantId"]);
                        null === (t = this.participantMap[i]) || void 0 === t || t._addStream(r), "audio" === r.media && (this.audioStreamIdMap[r.streamId.toString()] = i)
                    }));
                    t.streamsAdded.filter((({
                                                participantId: e,
                                                media: t
                                            }) => e !== this.localParticipant.id && "audio" === t)).forEach((e => {
                        const t = this.participantMap[e.participantId];
                        t && this._dispatch(de.REMOTEAUDIOPUBLISHED, {
                            remoteParticipant: t,
                            remoteAudio: t.getAudio(e.streamId)
                        })
                    }));
                    t.streamsAdded.filter((({
                                                participantId: e,
                                                media: t
                                            }) => e !== this.localParticipant.id && "video" === t)).forEach((e => {
                        const t = this.participantMap[e.participantId];
                        if (t) {
                            const i = t.getVideo(e.streamId);
                            this._dispatch(de.REMOTEVIDEOPUBLISHED, {
                                remoteParticipant: t,
                                remoteVideo: i
                            })
                        }
                    }))
                }
                t.streamsUpdated && t.streamsUpdated.forEach((({
                                                                   participantId: e,
                                                                   streamId: t,
                                                                   property: i
                                                               }) => {
                    var r;
                    if (e !== this.localParticipant.id)
                        if (null === (r = this.participantMap[e]) || void 0 === r || r._updateStream({
                            streamId: t,
                            property: i
                        }), i.hasOwnProperty("alwaysOn")) {
                            const r = this.participantMap[e];
                            if (r) {
                                const e = r.getAudio(t);
                                e._setAlwaysOn(i.alwaysOn), e._setActive(i.active), this._dispatch(de.REMOTEAUDIOSTATECHANGED, {
                                    remoteParticipant: r,
                                    remoteAudio: e
                                })
                            }
                        } else {
                            const r = this.participantMap[e];
                            if (r) {
                                const e = r.getVideo(t);
                                e._setActive(i.active), this._dispatch(de.REMOTEVIDEOSTATECHANGED, {
                                    remoteParticipant: r,
                                    remoteVideo: e
                                })
                            }
                        }
                })), t.streamsRemoved && t.streamsRemoved.forEach((({
                                                                        participantId: e,
                                                                        streamId: t
                                                                    }) => {
                    if (e === this.localParticipant.id) {
                        const e = this.localParticipant.getAudio(t),
                            i = this.localParticipant.getVideo(t);
                        e && this._dispatch(de.LOCALAUDIOUNPUBLISHED, {
                            localAudio: e
                        }), i && this._dispatch(de.LOCALVIDEOUNPUBLISHED, {
                            localVideo: i
                        })
                    } else {
                        const i = this.participantMap[e];
                        if (i) {
                            const e = i.getAudio(t),
                                r = i.getVideo(t);
                            e && this._dispatch(de.REMOTEAUDIOUNPUBLISHED, {
                                remoteParticipant: i,
                                remoteAudio: e
                            }), r && this._dispatch(de.REMOTEVIDEOUNPUBLISHED, {
                                remoteParticipant: i,
                                remoteVideo: r
                            }), i._removeStream(t)
                        }
                        const r = Object.values(this.receiverMap).find((e => t === e.streamId));
                        r && (r.streamId = null)
                    }
                }))
            })), this.downSession.on("StreamChanged", (({
                                                            params: e
                                                        }) => {
                if ("audio" === e.type) {
                    const t = e.receiverId,
                        i = e.streamId,
                        r = e.participantId;
                    if (0 === i) {
                        const e = this.audioOccupants[t];
                        if (e) {
                            const i = this.participantMap[e.id],
                                r = Object.keys(this.receiverMap).find((e => t === e));
                            if (i && r) {
                                const e = this.receiverMap[r].streamId;
                                if (e) {
                                    const r = i.getAudio(e);
                                    r && r._setReceiverId(t)
                                }
                            }
                            this._dispatch(de.REMOTEAUDIOUNSUBSCRIBED, {
                                remoteParticipant: i
                            })
                        }
                    } else {
                        const e = this.participantMap[r];
                        if (e) {
                            const r = e.getAudio(i);
                            r && r._setReceiverId(t)
                        }
                        this.audioOccupants[t] !== e && (this.audioOccupants[t] = e, this._dispatch(de.REMOTEAUDIOSUBSCRIBED, {
                            remoteParticipant: e
                        }))
                    }
                }
            })), this.downSession.on("UserMessage", (e => {
                e.forEach((e => {
                    const t = e.sender,
                        i = e.message,
                        r = e.type;
                    t !== this.localParticipant.id && this._dispatch(de.USERMESSAGE, {
                        senderId: t,
                        message: i,
                        type: r
                    })
                }))
            })), this.downSession.on("RoomDestroyed", (() => {
                this.disconnect("destroyed")
            })), this.downSession.on("Kick", (() => {
                this.disconnect("kicked")
            })), this.downSession.on("Inactivate", (() => {}))
        }
        _handleReceivers() {
            this.downSession.on("UpdatedReceivers", (({
                                                          name: e,
                                                          receivers: i
                                                      }) => t(this, void 0, void 0, (function*() {
                if ("init" !== e && "add" !== e || i.forEach((({
                                                                   type: e,
                                                                   receiverId: t
                                                               }) => {
                    this.receiverMap[t] = {
                        type: e,
                        streamId: null
                    }
                })), "init" === e) {
                    const e = [];
                    W(this.participantMap).forEach((t => {
                        e.push(t)
                    }));
                    const t = this.downSession.getFixedAudioReceiver();
                    this.remoteAudioElements._setReceivers(t);
                    this.remoteAudioElements.attach().forEach((e => document.body.appendChild(e))), yield this._setReceiverPool(this.config.videoReceiverInitialCount), this._dispatch(de.CONNECTED, {
                        remoteParticipants: e
                    })
                }
                "remove" === e && i.forEach((({
                                                  receiverId: e
                                              }) => {
                    delete this.receiverMap[e]
                }))
            }))))
        }
        getRemoteAudioLevels() {
            const e = this.downSession.getFixedAudioReceiver(),
                t = {
                    remoteParticipants: []
                };
            let i = 0;
            return e.forEach(((e, r) => {
                const o = e.getContributingSources().find((e => e.timestamp > this.audioLvlUpdateTs));
                if (o) {
                    i = o.timestamp;
                    const e = this.participantMap[this.audioStreamIdMap[o.source]];
                    if (e) {
                        let i = (65 + (20 * Math.log10(o.audioLevel || 0) + 3.0103)) / 70 * 100;
                        i > 100 ? i = 100 : i < 0 && (i = 0), i = Math.floor(i), t.remoteParticipants.push({
                            remoteParticipant: e,
                            level: i
                        })
                    }
                }
            })), i > 0 && (this.audioLvlUpdateTs = i), t
        }
        switchSpeaker(e) {
            return t(this, void 0, void 0, (function*() {
                const t = this.remoteAudioElements.audioElements.map((t => (t => new Promise(((i, r) => {
                    t.setSinkId(e).then((e => i(e))).catch((e => r(e)))
                })))(t)));
                yield Promise.all(t)
            }))
        }
        getLocalStats() {
            return t(this, void 0, void 0, (function*() {
                return yield this.upSession.getAllStats()
            }))
        }
        getRemoteStats() {
            return t(this, void 0, void 0, (function*() {
                return yield this.downSession.getAllStats()
            }))
        }
        _getLocalStatsReport() {
            return t(this, void 0, void 0, (function*() {
                const e = yield this.upSession.getStats(), t = e.audioStats.map((e => {
                    const t = W(this.localParticipant.audioMap).find((t => t.mediaStreamTrack.id === e.track.trackIdentifier)),
                        i = this.upSession.oldAudioStats.find((t => {
                            if (e.outboundRtp.id === t.outboundRtp.id) return !0
                        }));
                    let r = 0;
                    i && (r = e.outboundRtp.packetsSent - i.outboundRtp.packetsSent);
                    let o = 0;
                    return i && (o = e.outboundRtp.bytesSent - i.outboundRtp.bytesSent), {
                        participantId: this.localParticipant.id,
                        streamId: t.streamId,
                        bytesSent: e.outboundRtp.bytesSent,
                        bytesSentPerInterval: o,
                        packetsSent: e.outboundRtp.packetsSent,
                        packetsSentPerInterval: r,
                        srcAudioLevel: e.mediaSource.audioLevel
                    }
                }));
                this.upSession._setOldAudioStats(e.audioStats);
                const i = e.videoStats.map((e => {
                    const t = W(this.localParticipant.videoMap).find((t => {
                            if (t.cloneMediaStreamTracks.find((t => t.id === e.track.trackIdentifier))) return !0
                        })),
                        i = this.upSession.oldVideoStats.find((t => {
                            if (e.outboundRtp.id === t.outboundRtp.id) return !0
                        })),
                        r = this.upSession.streamIdMidMap[t.streamId];
                    let o = "l";
                    r.l === e.mid ? o = "l" : r.m === e.mid ? o = "m" : r.h === e.mid && (o = "h");
                    let n = 0;
                    i && (n = e.outboundRtp.packetsSent - i.outboundRtp.packetsSent);
                    let s = 0;
                    return i && (s = e.outboundRtp.bytesSent - i.outboundRtp.bytesSent), {
                        participantId: this.localParticipant.id,
                        streamId: t.streamId,
                        profile: o,
                        bytesSent: e.outboundRtp.bytesSent,
                        bytesSentPerInterval: s,
                        packetsSent: e.outboundRtp.packetsSent,
                        packetsSentPerInterval: n,
                        framesEncoded: e.outboundRtp.framesEncoded,
                        framesSent: e.outboundRtp.framesSent,
                        pliCount: e.outboundRtp.pliCount,
                        srcFrames: e.mediaSource.frames,
                        frameWidth: e.outboundRtp.frameWidth || 0,
                        frameHeight: e.outboundRtp.frameHeight || 0,
                        framesPerSecond: e.outboundRtp.framesPerSecond || 0
                    }
                }));
                this.upSession._setOldVideoStats(e.videoStats);
                const r = this.upSession.oldCandidatePair;
                let o = 0,
                    n = 0;
                return r && (o = (e.candidatePair.bytesSent || 0) - (r.bytesSent || 0), n = (e.candidatePair.packetsSent || 0) - (r.packetsSent || 0)), this.upSession._setOldCandidatePairStats(e.candidatePair), {
                    audioMetrics: t,
                    videoMetrics: i,
                    bytesSentPerInterval: o,
                    packetsSentPerInterval: n,
                    currentRTT: e.candidatePair.currentRoundTripTime || 0
                }
            }))
        }
        _getRemoteStatsReport() {
            return t(this, void 0, void 0, (function*() {
                const e = yield this.downSession.getStats(), t = e.audioStats.map((e => {
                    const t = this.downSession.audioTransceivers.find((t => t.receiver.track.id === e.track.trackIdentifier));
                    let i;
                    this.remoteParticipants.find((e => {
                        if (i = W(e.audioMap).find((e => e.receiverId === (null == t ? void 0 : t.mid))), i) return !0
                    }));
                    const r = this.downSession.oldAudioStats.find((t => {
                        if (e.inboundRtp.id === t.inboundRtp.id) return !0
                    }));
                    let o = 0;
                    r && (o = e.inboundRtp.packetsLost - r.inboundRtp.packetsLost);
                    let n = 0;
                    return r && (n = e.inboundRtp.bytesReceived - r.inboundRtp.bytesReceived), {
                        participantId: i ? i.participantId : "",
                        receiverId: Number(e.mid),
                        streamId: i ? i.audioId : 0,
                        bytesReceived: e.inboundRtp.bytesReceived,
                        bytesReceivedPerInterval: n,
                        totalSamplesReceived: e.inboundRtp.totalSamplesReceived,
                        audioLevel: e.inboundRtp.audioLevel,
                        packetsLost: e.inboundRtp.packetsLost,
                        packetsLostPerInterval: o
                    }
                }));
                this.downSession._setOldAudioStats(e.audioStats);
                const i = e.videoStats.map((e => {
                    let t;
                    this.remoteParticipants.some((i => {
                        if (t = W(i.videoMap).find((t => t.mediaStreamTrack && t.mediaStreamTrack.id === e.track.trackIdentifier)), t) return !0
                    }));
                    const i = this.downSession.oldVideoStats.find((t => {
                        if (e.inboundRtp.id === t.inboundRtp.id) return !0
                    }));
                    let r = 0;
                    i && (r = e.inboundRtp.packetsLost - i.inboundRtp.packetsLost);
                    let o = 0;
                    return i && (o = e.inboundRtp.bytesReceived - i.inboundRtp.bytesReceived), {
                        participantId: t ? t.participantId : "",
                        receiverId: Number(e.mid),
                        streamId: t ? t.videoId : 0,
                        bytesReceived: e.inboundRtp.bytesReceived,
                        bytesReceivedPerInterval: o,
                        framesReceived: e.inboundRtp.framesReceived,
                        framesDecoded: e.inboundRtp.framesDecoded,
                        packetsLost: e.inboundRtp.packetsLost,
                        packetsLostPerInterval: r,
                        pliCount: e.inboundRtp.pliCount,
                        frameWidth: e.inboundRtp.frameWidth || 0,
                        frameHeight: e.inboundRtp.frameHeight || 0,
                        framesPerSecond: e.inboundRtp.framesPerSecond || 0
                    }
                }));
                this.downSession._setOldVideoStats(e.videoStats);
                const r = this.downSession.oldCandidatePair;
                let o = 0,
                    n = 0;
                return r && (o = (e.candidatePair.bytesReceived || 0) - (r.bytesReceived || 0), n = (e.candidatePair.packetsReceived || 0) - (r.packetsReceived || 0)), this.downSession._setOldCandidatePairStats(e.candidatePair), {
                    audioMetrics: t,
                    videoMetrics: i,
                    availableIncomingBitrate: e.candidatePair.availableIncomingBitrate || 0,
                    bytesReceivedPerInterval: o,
                    packetsReceivedPerInterval: n,
                    currentRTT: e.candidatePair.currentRoundTripTime || 0
                }
            }))
        }
        _getStatsReport(e, t) {
            return {
                upSession: {
                    audios: e.audioMetrics.map((e => ({
                        type: "audio",
                        streamId: e.streamId,
                        bytesSent: e.bytesSent,
                        packetsSent: e.packetsSent,
                        srcAudioLevel: e.srcAudioLevel
                    }))),
                    videos: e.videoMetrics.map((e => ({
                        type: "video",
                        streamId: e.streamId,
                        profile: e.profile,
                        bytesSent: e.bytesSent,
                        framesEncoded: e.framesEncoded,
                        framesSent: e.framesSent,
                        pliCount: e.pliCount,
                        srcFrames: e.srcFrames
                    })))
                },
                downSession: {
                    audios: t.audioMetrics.map((e => ({
                        type: "audio",
                        receiverId: e.receiverId,
                        streamId: e.streamId,
                        bytesReceived: e.bytesReceived,
                        totalSamplesReceived: e.totalSamplesReceived,
                        audioLevel: e.audioLevel,
                        packetsLost: e.packetsLost
                    }))),
                    videos: t.videoMetrics.map((e => ({
                        type: "video",
                        receiverId: e.receiverId,
                        streamId: e.streamId,
                        bytesReceived: e.bytesReceived,
                        framesReceived: e.framesReceived,
                        framesDecoded: e.framesDecoded,
                        packetsLost: e.packetsLost,
                        pliCount: e.pliCount
                    })))
                }
            }
        }
        _dispatch(e, t) {
            this.emit(e, t)
        }
        sendUserMessage(e, i, r = "normal") {
            return t(this, void 0, void 0, (function*() {
                yield this.upSession._callSendMessage({
                    targets: e,
                    message: i,
                    type: r
                })
            }))
        }
        _startQualityMetricReport(e) {
            if (M.collectionPeriod > 0) {
                let i = 0;
                this.qualityMetricInterval = window.setInterval((() => t(this, void 0, void 0, (function*() {
                    const t = yield this._getLocalStatsReport(), r = yield this._getRemoteStatsReport(), o = this._getStatsReport(t, r), n = {
                        direction: "up",
                        index: this.upSession.index,
                        metrics: [...o.upSession.audios, ...o.upSession.videos]
                    }, s = {
                        direction: "down",
                        index: this.downSession.index,
                        metrics: [...o.downSession.audios, ...o.downSession.videos]
                    };
                    if (i++, i === M.collectionPeriod) {
                        const t = "CnL.QualityMetrics",
                            r = {
                                serviceId: this.authConfig.serviceId,
                                roomId: e,
                                participantId: this.localParticipant.id,
                                sessions: [n, s]
                            };
                        M.send({
                            method: t,
                            params: r
                        }), i = 0
                    }
                    this._dispatch(de.STAT, {
                        qualityStat: {
                            localQualityStat: t,
                            remoteQualityStat: r
                        }
                    })
                }))), this.config.statInterval)
            }
        }
    }
    e([x("info")], pe.prototype, "connect", null), e([x("info")], pe.prototype, "disconnect", null), e([x("info")], pe.prototype, "publish", null), e([x("info")], pe.prototype, "unpublish", null), e([x("info")], pe.prototype, "subscribe", null), e([x("info")], pe.prototype, "unsubscribe", null), e([x("debug")], pe.prototype, "getParticipant", null), e([x("debug")], pe.prototype, "getAudioOccupants", null), e([x("debug")], pe.prototype, "getRemoteVideo", null), e([x("debug")], pe.prototype, "getRemoteAudio", null), e([x("info")], pe.prototype, "_checkMaxReceiverCount", null), e([x("info")], pe.prototype, "_getCurrentReceiverCount", null), e([x("debug")], pe.prototype, "_setReceiverPool", null), e([x("info")], pe.prototype, "_assignVideoStream", null), e([x("debug")], pe.prototype, "_handleParticipantsInfo", null), e([x("debug")], pe.prototype, "_handleReceivers", null), e([x("debug")], pe.prototype, "switchSpeaker", null);
    class me {
        constructor() {
            new V(1901, "ConnectLive??? ?????? ?????? ????????? ????????? ??? ????????????.")
        }
        static on(e, t) {
            this.emitter.on(e, t)
        }
        static _startAuthTimer() {
            if (this.authResponse) {
                const e = Math.floor(.9 * this.authResponse.ttl * 1e3);
                let i = e;
                const r = () => t(this, void 0, void 0, (function*() {
                    if (this.authResponse) try {
                        const e = yield this.authApiClient.refreshToken(this.authConfig.serviceId, this.authResponse.token);
                        this.authResponse.token = e.token, this.authResponse.ttl = e.ttl, this._startAuthTimer()
                    } catch (e) {
                        P.error("token refresh error");
                        const o = 6e5;
                        i -= o, i < 0 ? this.emitter.emit("tokenRefreshError", e) : (this.emitter.emit("tokenRefreshWarning", e), window.setTimeout((() => t(this, void 0, void 0, (function*() {
                            r()
                        }))), o))
                    }
                }));
                this.authRefreshTimer = window.setTimeout((() => t(this, void 0, void 0, (function*() {
                    r()
                }))), e)
            }
        }
        static signIn(e) {
            return t(this, void 0, void 0, (function*() {
                this.authRefreshTimer > -1 && this.signOut();
                const t = (r = "connectlive-fingerprint", window.localStorage.getItem(r) || "");
                var r;
                this.authConfig = e, this.authResponse = yield this.authApiClient.authorize(e, t), ((e, t) => {
                    window.localStorage.setItem(e, t)
                })("connectlive-fingerprint", this.authResponse.fingerprint), this._startAuthTimer(), yield M.createWebSocket(this.authResponse.cnl, this.authResponse.token), P.info("[method][Function.signIn]", e);
                const o = _.getDevice(),
                    n = _.getEngine(),
                    s = _.getOS(),
                    a = _.getBrowser(),
                    d = _.getCPU();
                P.debug("DEVICE TYPE =", o.type + ",", "DEVICE VENDOR =", o.vendor + ",", "DEVICE MODEL =", o.model + ",", "ENGINE NAME =", n.name + ",", "ENGINE VERSION =", n.version + ",", "OS NAME =", s.name + ",", "OS VERSION =", s.version + ",", "BROWSER NAME =", a.name + ",", "BROWSER VERSION =", a.version + ",", "CPU =", d.architecture + ",", "SDK VERSION =", i), this.signStatus = "signin"
            }))
        }
        static signOut() {
            window.clearTimeout(this.authRefreshTimer), this.authRefreshTimer = -1, this.authResponse = null, this.signStatus = "signout", M.destroy()
        }
        static createLocalMedia(e) {
            return t(this, void 0, void 0, (function*() {
                const t = new ne(e || {});
                return e && (yield t._getUserMedia()), t
            }))
        }
        static createLocalScreen(e) {
            return t(this, void 0, void 0, (function*() {
                const t = new ae(e);
                return yield t._getDisplayMedia(), t
            }))
        }
        static createRoom(e) {
            if (this.authResponse) return new pe(this.authConfig, this.authResponse, e);
            throw new V(1106, "??? ?????? ??? ????????? ???????????????.")
        }
    }
    return me.emitter = new $, me.authApiClient = new U, me.authRefreshTimer = -1, me.signStatus = "signout", me.version = i, me.logger = P, e([x("info")], me, "signOut", null), e([x("info")], me, "createLocalMedia", null), e([x("info")], me, "createLocalScreen", null), e([x("info")], me, "createRoom", null), me
}();