!(function (e, $) {
  "use strict";
  var n = {
    encode: function e($) {
      var n,
        t = new ArrayBuffer(256),
        r = new DataView(t),
        f = 0;
      function u(e) {
        for (var $ = t.byteLength, u = f + e; $ < u; ) $ <<= 1;
        if ($ !== t.byteLength) {
          var i = r;
          (t = new ArrayBuffer($)), (r = new DataView(t));
          for (var o = (f + 3) >> 2, s = 0; s < o; ++s)
            r.setUint32(s << 2, i.getUint32(s << 2));
        }
        return (n = e), r;
      }
      function i() {
        f += n;
      }
      function o(e) {
        i(u(1).setUint8(f, e));
      }
      function s(e) {
        for (var $ = u(e.length), n = 0; n < e.length; ++n)
          $.setUint8(f + n, e[n]);
        i();
      }
      function a(e, $) {
        var n, t, r, s, a;
        $ < 24
          ? o((e << 5) | $)
          : $ < 256
            ? (o((e << 5) | 24), o($))
            : $ < 65536
              ? (o((e << 5) | 25), (n = $), i(u(2).setUint16(f, n)))
              : $ < 4294967296
                ? (o((e << 5) | 26), (t = $), i(u(4).setUint32(f, t)))
                : (o((e << 5) | 27),
                  (s = (r = $) % 4294967296),
                  (a = u(8)).setUint32(f, (r - s) / 4294967296),
                  a.setUint32(f + 4, s),
                  i());
      }
      if (
        (!(function e($) {
          if (!1 === $) return o(244);
          if (!0 === $) return o(245);
          if (null === $) return o(246);
          if (void 0 === $) return o(247);
          switch (typeof $) {
            case "number":
              var n;
              if (Math.floor($) === $) {
                if (0 <= $ && $ <= 9007199254740992) return a(0, $);
                if (-9007199254740992 <= $ && $ < 0) return a(1, -($ + 1));
              }
              return o(251), (n = $), void i(u(8).setFloat64(f, n));
            case "string":
              var t,
                r,
                c = [];
              for (t = 0; t < $.length; ++t) {
                var x = $.charCodeAt(t);
                x < 128
                  ? c.push(x)
                  : x < 2048
                    ? (c.push(192 | (x >> 6)), c.push(128 | (63 & x)))
                    : x < 55296
                      ? (c.push(224 | (x >> 12)),
                        c.push(128 | ((x >> 6) & 63)),
                        c.push(128 | (63 & x)))
                      : ((x = (1023 & x) << 10),
                        (x |= 1023 & $.charCodeAt(++t)),
                        (x += 65536),
                        c.push(240 | (x >> 18)),
                        c.push(128 | ((x >> 12) & 63)),
                        c.push(128 | ((x >> 6) & 63)),
                        c.push(128 | (63 & x)));
              }
              return a(3, c.length), s(c);
            default:
              if (Array.isArray($))
                for (a(4, (r = $.length)), t = 0; t < r; ++t) e($[t]);
              else if ($ instanceof Uint8Array) a(2, $.length), s($);
              else {
                var _ = Object.keys($);
                for (a(5, (r = _.length)), t = 0; t < r; ++t) {
                  var h = _[t];
                  e(h), e($[h]);
                }
              }
          }
        })($),
        "slice" in t)
      )
        return t.slice(0, f);
      for (var c = new ArrayBuffer(f), x = new DataView(c), _ = 0; _ < f; ++_)
        x.setUint8(_, r.getUint8(_));
      return c;
    },
    decode: function e($, n, t) {
      var r = new DataView($),
        f = 0;
      function u(e, $) {
        return (f += e), $;
      }
      function i(e) {
        var n, t;
        return (n = e), (t = new Uint8Array($, f, e)), (f += n), t;
      }
      function o() {
        var e;
        return (e = r.getUint8(f)), (f += 1), e;
      }
      function s() {
        var e;
        return (e = r.getUint16(f)), (f += 2), e;
      }
      function a() {
        var e;
        return (e = r.getUint32(f)), (f += 4), e;
      }
      function c() {
        return 255 === r.getUint8(f) && ((f += 1), !0);
      }
      function x(e) {
        if (e < 24) return e;
        if (24 === e) return o();
        if (25 === e) return s();
        if (26 === e) return a();
        if (27 === e) return 4294967296 * a() + a();
        if (31 === e) return -1;
        throw "Invalid length encoding";
      }
      function _(e) {
        var $ = o();
        if (255 === $) return -1;
        var n = x(31 & $);
        if (n < 0 || $ >> 5 !== e) throw "Invalid indefinite length element";
        return n;
      }
      function h(e, $) {
        for (var n = 0; n < $; ++n) {
          var t = o();
          128 & t &&
            (t < 224
              ? ((t = ((31 & t) << 6) | (63 & o())), ($ -= 1))
              : t < 240
                ? ((t = ((15 & t) << 12) | ((63 & o()) << 6) | (63 & o())),
                  ($ -= 2))
                : ((t =
                    ((15 & t) << 18) |
                    ((63 & o()) << 12) |
                    ((63 & o()) << 6) |
                    (63 & o())),
                  ($ -= 3))),
            t < 65536
              ? e.push(t)
              : ((t -= 65536),
                e.push(55296 | (t >> 10)),
                e.push(56320 | (1023 & t)));
        }
      }
      "function" != typeof n &&
        (n = function (e) {
          return e;
        }),
        "function" != typeof t && (t = function () {});
      var l = (function e() {
        var $,
          u,
          a,
          l = o(),
          v = l >> 5,
          g = 31 & l;
        if (7 === v)
          switch (g) {
            case 25:
              return (function e() {
                var $ = new ArrayBuffer(4),
                  n = new DataView($),
                  t = s(),
                  r = 32768 & t,
                  f = 31744 & t,
                  u = 1023 & t;
                if (31744 === f) f = 261120;
                else if (0 !== f) f += 114688;
                else if (0 !== u)
                  return (r ? -1 : 1) * u * 5960464477539063e-23;
                return (
                  n.setUint32(0, (r << 16) | (f << 13) | (u << 13)),
                  n.getFloat32(0)
                );
              })();
            case 26:
              return (C = r.getFloat32(f)), (f += 4), C;
            case 27:
              return (F = r.getFloat64(f)), (f += 8), F;
          }
        if ((u = x(g)) < 0 && (v < 2 || 6 < v)) throw "Invalid length";
        switch (v) {
          case 0:
            return u;
          case 1:
            return -1 - u;
          case 2:
            if (u < 0) {
              for (var p = [], d = 0; (u = _(v)) >= 0; ) (d += u), p.push(i(u));
              var w = new Uint8Array(d),
                U = 0;
              for ($ = 0; $ < p.length; ++$) w.set(p[$], U), (U += p[$].length);
              return w;
            }
            return i(u);
          case 3:
            var y = [];
            if (u < 0) for (; (u = _(v)) >= 0; ) h(y, u);
            else h(y, u);
            return String.fromCharCode.apply(null, y);
          case 4:
            if (u < 0) for (a = []; !c(); ) a.push(e());
            else for ($ = 0, a = Array(u); $ < u; ++$) a[$] = e();
            return a;
          case 5:
            var b,
              C,
              m,
              F,
              A = {};
            for ($ = 0; $ < u || (u < 0 && !c()); ++$) A[e()] = e();
            return A;
          case 6:
            return n(e(), u);
          case 7:
            switch (u) {
              case 20:
                return !1;
              case 21:
                return !0;
              case 22:
                return null;
              case 23:
                return;
              default:
                return t(u);
            }
        }
      })();
      if (f !== $.byteLength) throw "Remaining bytes";
      return l;
    },
  };
  "function" == typeof define && define.amd
    ? define("cbor/cbor", n)
    : "undefined" != typeof module && module.exports
      ? (module.exports = n)
      : e.CBOR || (e.CBOR = n);
})(this);
