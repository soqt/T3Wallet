// if (typeof Buffer === 'undefined') Buffer = require('buffer/').Buffer
// if (typeof XMLHttpRequest === 'undefined') XMLHttpRequest = require('xhr2')
const BN = require('bignumber.js')
// const
// CLI below
const defaultProvider = 'https://rpc.tezrpc.me/'
const library = {
  bs58check: require('bs58check'),
  sodium: require('libsodium-wrappers'),
  bip39: require('bip39'),
  pbkdf2: require('pbkdf2'),
}
const prefix = {
  tz1: new Uint8Array([6, 161, 159]),
  tz2: new Uint8Array([6, 161, 161]),
  tz3: new Uint8Array([6, 161, 164]),
  KT: new Uint8Array([2, 90, 121]),

  edpk: new Uint8Array([13, 15, 37, 217]),
  edsk2: new Uint8Array([13, 15, 58, 7]),
  spsk: new Uint8Array([17, 162, 224, 201]),
  p2sk: new Uint8Array([16, 81, 238, 189]),

  sppk: new Uint8Array([3, 254, 226, 86]),
  p2pk: new Uint8Array([3, 178, 139, 127]),

  edesk: new Uint8Array([7, 90, 60, 179, 41]),

  edsk: new Uint8Array([43, 246, 78, 7]),
  edsig: new Uint8Array([9, 245, 205, 134, 18]),
  spsig1: new Uint8Array([13, 115, 101, 19, 63]),
  p2sig: new Uint8Array([54, 240, 44, 52]),
  sig: new Uint8Array([4, 130, 43]),

  Net: new Uint8Array([87, 82, 0]),
  nce: new Uint8Array([69, 220, 169]),
  b: new Uint8Array([1, 52]),
  o: new Uint8Array([5, 116]),
  Lo: new Uint8Array([133, 233]),
  LLo: new Uint8Array([29, 159, 109]),
  P: new Uint8Array([2, 170]),
  Co: new Uint8Array([79, 179]),
  id: new Uint8Array([153, 103]),
}
const watermark = {
  block: new Uint8Array([1]),
  endorsement: new Uint8Array([2]),
  generic: new Uint8Array([3]),
}
const utility = {
  totez: m => parseInt(m, 10) / 1000000,
  mutez (tz) {
    return new BN(new BN(tz).toFixed(6)).multipliedBy(1000000).toString()
  },
  b58cencode: (payload, prefixArg) => {
    const n = new Uint8Array(prefixArg.length + payload.length)
    n.set(prefixArg)
    n.set(payload, prefixArg.length)
    return library.bs58check.encode(Buffer.from(n, 'hex'))
  },
  b58cdecode: (enc, prefixArg) => library.bs58check.decode(enc).slice(prefixArg.length),
  buf2hex (buffer) {
    const byteArray = new Uint8Array(buffer)
    const hexParts = []
    for (let i = 0; i < byteArray.length; i++) {
      let hex = byteArray[i].toString(16)
      let paddedHex = `00${hex}`.slice(-2)
      hexParts.push(paddedHex)
    }
    return hexParts.join('')
  },
  hex2buf (hex) {
    return new Uint8Array(
      hex.match(/[\da-f]{2}/gi).map((h) => {
        return parseInt(h, 16)
      })
    )
  },
  hexNonce (length) {
    let chars = '0123456789abcedf'
    let hex = ''
    while (length--) hex += chars[(Math.random() * 16) | 0] // eslint-disable-line no-bitwise
    return hex
  },
  mergebuf (b1, b2) {
    let r = new Uint8Array(b1.length + b2.length)
    r.set(b1)
    r.set(b2, b1.length)
    return r
  },
  sexp2mic: function me (mi) {
    mi = mi
      .replace(/(?:@[a-z_]+)|(?:#.*$)/gm, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (mi.charAt(0) === '(') mi = mi.slice(1, -1)
    let pl = 0
    let sopen = false
    let escaped = false
    let ret = {
      prim: '',
      args: [],
    }
    let val = ''
    for (let i = 0; i < mi.length; i++) {
      if (escaped) {
        val += mi[i]
        escaped = false
        continue
      } else if (
        (i === mi.length - 1 && sopen === false)
        || (mi[i] === ' ' && pl === 0 && sopen === false)
      ) {
        if (i === mi.length - 1) val += mi[i]
        if (val) {
          if (val === parseInt(val, 10).toString()) {
            if (!ret.prim) return { int: val }
            ret.args.push({ int: val })
          } else if (val[0] === '0') {
            if (!ret.prim) return { bytes: val }
            ret.args.push({ bytes: val })
          } else if (ret.prim) {
            ret.args.push(me(val))
          } else {
            ret.prim = val
          }
          val = ''
        }
        continue
      } else if (mi[i] === '"' && sopen) {
        sopen = false
        if (!ret.prim) return { string: val }
        ret.args.push({ string: val })
        val = ''
        continue
      } else if (mi[i] === '"' && !sopen && pl === 0) {
        sopen = true
        continue
      } else if (mi[i] === '\\') escaped = true
      else if (mi[i] === '(') pl++
      else if (mi[i] === ')') pl--
      val += mi[i]
    }
    return ret
  },
  mic2arr: function me2 (s) {
    let ret = []
    if (Object.prototype.hasOwnProperty.call(s, 'prim')) {
      if (s.prim === 'Pair') {
        ret.push(me2(s.args[0]))
        ret = ret.concat(me2(s.args[1]))
      } else if (s.prim === 'Elt') {
        ret = {
          key: me2(s.args[0]),
          val: me2(s.args[1]),
        }
      } else if (s.prim === 'True') {
        ret = true
      } else if (s.prim === 'False') {
        ret = false
      }
    } else if (Array.isArray(s)) {
      let sc = s.length
      for (let i = 0; i < sc; i++) {
        let n = me2(s[i])
        if (typeof n.key !== 'undefined') {
          if (Array.isArray(ret)) {
            ret = {
              keys: [],
              vals: [],
            }
          }
          ret.keys.push(n.key)
          ret.vals.push(n.val)
        } else {
          ret.push(n)
        }
      }
    } else if (Object.prototype.hasOwnProperty.call(s, 'string')) {
      ret = s.string
    } else if (Object.prototype.hasOwnProperty.call(s, 'init')) {
      ret = parseInt(s.int, 10)
    } else {
      ret = s
    }
    return ret
  },
  ml2mic: function me (mi) {
    const ret = []
    let inseq = false
    let seq = ''
    let val = ''
    let pl = 0
    let bl = 0
    let sopen = false
    let escaped = false
    for (let i = 0; i < mi.length; i++) {
      if (val === '}' || val === ';') {
        val = ''
      }
      if (inseq) {
        if (mi[i] === '}') {
          bl--
        } else if (mi[i] === '{') {
          bl++
        }
        if (bl === 0) {
          let st = me(val)
          ret.push({
            prim: seq.trim(),
            args: [st],
          })
          val = ''
          bl = 0
          inseq = false
        }
      } else if (mi[i] === '{') {
        bl++
        seq = val
        val = ''
        inseq = true
        continue
      } else if (escaped) {
        val += mi[i]
        escaped = false
        continue
      } else if (
        (i === mi.length - 1 && sopen === false)
        || (mi[i] === ';' && pl === 0 && sopen === false)
      ) {
        if (i === mi.length - 1) val += mi[i]
        if (val.trim() === '' || val.trim() === '}' || val.trim() === ';') {
          val = ''
          continue
        }
        ret.push(utility.ml2tzjson(val))
        val = ''
        continue
      } else if (mi[i] === '"' && sopen) sopen = false
      else if (mi[i] === '"' && !sopen) sopen = true
      else if (mi[i] === '\\') escaped = true
      else if (mi[i] === '(') pl++
      else if (mi[i] === ')') pl--
      val += mi[i]
    }
    return ret
  },
  formatMoney: (n, c, d, t) => {
    const cc = isNaN((c = Math.abs(c))) ? 2 : c; // eslint-disable-line
    const dd = d === undefined ? '.' : d
    const tt = t === undefined ? ',' : t
    const s = n < 0 ? '-' : ''
    const i = String(parseInt((n = Math.abs(Number(n) || 0).toFixed(cc)), 10))
    const j = i.length > 3 ? i.length % 3 : 0
    return (
      s
      + (j ? i.substr(0, j) + tt : '')
      + i.substr(j).replace(/(\d{3})(?=\d)/g, `$1${tt}`)
      + (cc
        ? dd
          + Math.abs(n - i)
            .toFixed(c)
            .slice(2)
        : '')
    )
  },
}
// TODO: Add p256 and secp256k1 cryptographay
const crypto = {
  extractEncryptedKeys (esk, password) {
    if (typeof esk === 'undefined') return false
    if (typeof password === 'undefined') return false
    if (typeof window.crypto.subtle === 'undefined') return false

    const esb = utility.b58cdecode(esk, prefix.edesk)
    const salt = esb.slice(0, 8)
    const esm = esb.slice(8)

    return window.crypto.subtle.importKey('raw', new TextEncoder('utf-8').encode(password), { name: 'PBKDF2' }, false, ['deriveBits']).then((key) => {
      console.log(key)
      return window.crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt,
          iterations: 32768,
          hash: { name: 'SHA-512' },
        },
        key,
        256
      )
    }).then((key) => {
      console.log(key)
      console.log(library.sodium.crypto_secretbox_open_easy(esm, new Uint8Array(24), new Uint8Array(key)))
      const kp = library.sodium.crypto_sign_seed_keypair(library.sodium.crypto_secretbox_open_easy(esm, new Uint8Array(24), new Uint8Array(key)))
      return {
        sk: utility.b58cencode(kp.privateKey, prefix.edsk),
        pk: utility.b58cencode(kp.publicKey, prefix.edpk),
        pkh: utility.b58cencode(library.sodium.crypto_generichash(20, kp.publicKey), prefix.tz1),
      }
    })
  },
  extractKeys: (sk) => {
    const pref = sk.substr(0, 4)
    switch (pref) {
      case 'edsk':
        if (sk.length === 98) {
          return {
            pk: utility.b58cencode(utility.b58cdecode(sk, prefix.edsk).slice(32), prefix.edpk),
            pkh: utility.b58cencode(library.sodium.crypto_generichash(20, utility.b58cdecode(sk, prefix.edsk).slice(32)), prefix.tz1),
            sk,
          }
        } if (sk.length === 54) { // seed
          const s = utility.b58cdecode(sk, prefix.edsk2)
          const kp = library.sodium.crypto_sign_seed_keypair(s)
          return {
            sk: utility.b58cencode(kp.privateKey, prefix.edsk),
            pk: utility.b58cencode(kp.publicKey, prefix.edpk),
            pkh: utility.b58cencode(library.sodium.crypto_generichash(20, kp.publicKey), prefix.tz1),
          }
        }
        break
      default:
        return false
    }
    return false
  },
  generateMnemonic: () => library.bip39.generateMnemonic(256),
  checkAddress (a) {
    try {
      utility.b58cdecode(a, prefix.tz1)
      return true
    } catch (e) {
      return false
    }
  },
  generateKeysNoSeed () {
    const kp = library.sodium.crypto_sign_keypair()
    return {
      sk: utility.b58cencode(kp.privateKey, prefix.edsk),
      pk: utility.b58cencode(kp.publicKey, prefix.edpk),
      pkh: utility.b58cencode(library.sodium.crypto_generichash(20, kp.publicKey), prefix.tz1),
    }
  },
  generateKeys (m, p) {
    const s = library.bip39.mnemonicToSeed(m, p).slice(0, 32)
    const kp = library.sodium.crypto_sign_seed_keypair(s)
    return {
      mnemonic: m,
      passphrase: p,
      sk: utility.b58cencode(kp.privateKey, prefix.edsk),
      pk: utility.b58cencode(kp.publicKey, prefix.edpk),
      pkh: utility.b58cencode(library.sodium.crypto_generichash(20, kp.publicKey), prefix.tz1),
    }
  },
  generateKeysFromSeedMulti (m, p, n) {
    n /= (256 ^ 2) // eslint-disable-line no-bitwise
    const s = library.bip39.mnemonicToSeed(m, library.pbkdf2.pbkdf2Sync(p, n.toString(36).slice(2), 0, 32, 'sha512').toString()).slice(0, 32)
    const kp = library.sodium.crypto_sign_seed_keypair(s)
    return {
      mnemonic: m,
      passphrase: p,
      n,
      sk: utility.b58cencode(kp.privateKey, prefix.edsk),
      pk: utility.b58cencode(kp.publicKey, prefix.edpk),
      pkh: utility.b58cencode(library.sodium.crypto_generichash(20, kp.publicKey), prefix.tz1),
    }
  },
  sign (bytes, sk, wm) {
    let bb = utility.hex2buf(bytes)
    if (typeof wm !== 'undefined') bb = utility.mergebuf(wm, bb)
    const sig = library.sodium.crypto_sign_detached(library.sodium.crypto_generichash(32, bb), utility.b58cdecode(sk, prefix.edsk), 'uint8array')
    const edsig = utility.b58cencode(sig, prefix.edsig)
    const sbytes = bytes + utility.buf2hex(sig)
    return {
      bytes,
      sig,
      edsig,
      sbytes,
    }
  },
  verify (bytes, sig, pk) {
    return library.sodium.crypto_sign_verify_detached(sig, utility.hex2buf(bytes), utility.b58cdecode(pk, prefix.edpk))
  },
}
const node = {
  activeProvider: defaultProvider,
  debugMode: false,
  async: true,
  setDebugMode (t) {
    node.debugMode = t
  },
  setProvider (u) {
    node.activeProvider = u
  },
  resetProvider () {
    node.activeProvider = defaultProvider
  },
  query (e, o, t) {
    if (typeof o === 'undefined') {
      if (typeof t === 'undefined') {
        t = 'GET'
      } else { o = {} }
    } else if (typeof t === 'undefined') { t = 'POST' }
    return new Promise(((resolve, reject) => {
      try {
        const http = new XMLHttpRequest()
        http.open(t, node.activeProvider + e, node.async)
        if (node.debugMode) { console.log(e, o, http.responseText) }
        http.onload = function () {
          if (http.status === 200) {
            if (http.responseText) {
              let r = JSON.parse(http.responseText)
              if (typeof r.error !== 'undefined') {
                reject(r.error)
              } else {
                if (typeof r.ok !== 'undefined') r = r.ok
                resolve(r)
              }
            } else {
              reject(new Error('Empty response returned'))
            }
          } else if (http.responseText) {
            reject(http.responseText)
          } else {
            reject(http.statusText)
          }
        }
        http.onerror = function () {
          if (node.debugMode) { console.log(e, o, http.responseText) }
          reject(http.statusText)
        }
        if (t === 'POST') {
          http.setRequestHeader('Content-Type', 'application/json')
          http.send(JSON.stringify(o))
        } else {
          http.send()
        }
      } catch (error) { reject(error) }
    }))
  },
}
const rpc = {
  account (keys, amount, spendable, delegatable, delegate, fee) {
    const operation = {
      kind: 'origination',
      fee: fee.toString(),
      managerPubkey: keys.pkh,
      balance: utility.mutez(amount).toString(),
      spendable: (typeof spendable !== 'undefined' ? spendable : true),
      delegatable: (typeof delegatable !== 'undefined' ? delegatable : true),
      delegate: (typeof delegate !== 'undefined' && delegate ? delegate : undefined),
    }
    return rpc.sendOperation(keys.pkh, operation, keys)
  },
  getBalance (tz1) {
    return node.query(`/chains/main/blocks/head/context/contracts/${tz1}/balance`).then((r) => {
      return r
    })
  },
  getDelegate (tz1) {
    return node.query(`/chains/main/blocks/head/context/contracts/${tz1}/delegate`).then((r) => {
      if (r) return r
      return false
    }).catch(() => { return false })
  },
  getHead () {
    return node.query('/chains/main/blocks/head')
  },
  getHeadHash () {
    return node.query('/chains/main/blocks/head/hash')
  },
  call (e, d) {
    return node.query(e, d)
  },
  sendOperation: async (from, operation, keys) => {
    if (typeof keys === 'undefined') keys = false
    let counter
    let sopbytes
    let opOb
    // let errors = []
    // let opResponse = []
    let promises = []
    let requiresReveal = false
    let head

    promises.push(node.query('/chains/main/blocks/head/header'))
    let ops
    if (Array.isArray(operation)) {
      ops = operation
    } else {
      ops = [operation]
    }

    for (let i = 0; i < ops.length; i++) {
      if (['transaction', 'origination', 'delegation'].indexOf(ops[i].kind) >= 0) {
        requiresReveal = true
        promises.push(node.query(`/chains/main/blocks/head/context/contracts/${from}/counter`))
        promises.push(node.query(`/chains/main/blocks/head/context/contracts/${from}/manager_key`))
        break
      }
    }
    try {
      const [header, headCounter, manager] = await Promise.all(promises)
      head = header
      if (requiresReveal && keys && typeof manager.key === 'undefined') {
        ops.unshift({
          kind: 'reveal',
          fee: 0,
          public_key: keys.pk,
          source: from,
        })
      }
      counter = parseInt(headCounter, 10) + 1
      for (let i = 0; i < ops.length; i++) {
        if (['proposals', 'ballot', 'transaction', 'origination', 'delegation'].indexOf(ops[i].kind) >= 0) {
          if (typeof ops[i].source === 'undefined') ops[i].source = from
        }
        if (['reveal', 'transaction', 'origination', 'delegation'].indexOf(ops[i].kind) >= 0) {
          if (typeof ops[i].gas_limit === 'undefined') ops[i].gas_limit = '0'
          if (typeof ops[i].storage_limit === 'undefined') ops[i].storage_limit = '0'
          ops[i].counter = (counter++).toString()

          ops[i].fee = ops[i].fee.toString()
          ops[i].gas_limit = ops[i].gas_limit.toString()
          ops[i].storage_limit = ops[i].storage_limit.toString()
          ops[i].counter = ops[i].counter.toString()
        }
      }
      opOb = {
        branch: head.hash,
        contents: ops,
      }

      const opbytes = await node.query(`/chains/${head.chain_id}/blocks/${head.hash}/helpers/forge/operations`, opOb)
      opOb.protocol = head.protocol

      if (keys && !keys.sk) return { opbytes, opOb }

      if (!keys) {
        sopbytes = `${opbytes}00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`
        opOb.signature = 'edsigtXomBKi5CTRf5cjATJWSyaRvhfYNHqSUGrn4SdbYRcGwQrUGjzEfQDTuqHhuA8b2d8NarZjz8TRf65WkpQmo423BtomS8Q'
      } else {
        let signed = crypto.sign(opbytes, keys.sk, watermark.generic)
        sopbytes = signed.sbytes
        opOb.signature = signed.edsig
      }

      const { hash, operations } = await rpc.inject(opOb, sopbytes)
      return { hash, operations }
    } catch (err) {
      throw new Error(err)
    }
  },
  inject: async (opOb, sopbytes) => {
    let opResponse = []
    let errors = []
    try {
      const f = await node.query('/chains/main/blocks/head/helpers/preapply/operations', [opOb])
      if (!Array.isArray(f)) throw new Error(JSON.stringify({ error: 'RPC Fail', errors: [] }))
      for (let i = 0; i < f.length; i++) {
        for (let j = 0; j < f[i].contents.length; j++) {
          opResponse.push(f[i].contents[j])
          if (typeof f[i].contents[j].metadata.operation_result !== 'undefined' && f[i].contents[j].metadata.operation_result.status === 'failed') {
            errors = errors.concat(f[i].contents[j].metadata.operation_result.errors)
          }
        }
      }
      if (errors.length) throw new Error(JSON.stringify({ error: 'Operation Failed', errors }))
      const hash = await node.query('/injection/operation', sopbytes)
      return { hash, operations: opResponse }
    } catch (err) {
      throw err
    }
  },
  transfer: (from, keys, to, amount, fee, parameter, gasLimit, storageLimit) => {
    if (typeof gasLimit === 'undefined') gasLimit = '200'
    if (typeof storageLimit === 'undefined') storageLimit = '0'
    let operation = {
      kind: 'transaction',
      fee: fee.toString(),
      gas_limit: gasLimit,
      storage_limit: storageLimit,
      amount: utility.mutez(amount).toString(),
      destination: to,
    }
    if (typeof parameter === 'undefined') parameter = false
    if (parameter) {
      operation.parameters = utility.sexp2mic(parameter)
    }
    return rpc.sendOperation(from, operation, keys)
  },
  activate: (pkh, secret) => {
    let operation = {
      kind: 'activate_account',
      pkh,
      secret,
    }
    return rpc.sendOperation(pkh, operation, false)
  },
  originate (keys, amount, code, init, spendable, delegatable, delegate, fee, gasLimit, storageLimit) {
    if (typeof gasLimit === 'undefined') gasLimit = '10000'
    if (typeof storageLimit === 'undefined') storageLimit = '10000'
    let _code = utility.ml2mic(code)
    let script = {
      code: _code,
      storage: utility.sexp2mic(init),
    }
    let operation = {
      kind: 'origination',
      balance: utility.mutez(amount).toString(),
      managerPubkey: keys.pkh,
      storage_limit: storageLimit,
      gas_limit: gasLimit,
      fee: fee.toString(),
      script,
    }
    if (typeof spendable !== 'undefined') operation.spendable = spendable
    if (typeof delegatable !== 'undefined') operation.delegatable = delegatable
    if (typeof delegate !== 'undefined' && delegate) operation.delegate = delegate
    return rpc.sendOperation(keys.pkh, operation, keys)
  },
  setDelegate (from, keys, delegate, fee, gasLimit, storageLimit) {
    if (typeof gasLimit === 'undefined') gasLimit = '10000'
    if (typeof storageLimit === 'undefined') storageLimit = '0'
    let operation = {
      kind: 'delegation',
      fee: fee.toString(),
      gas_limit: gasLimit,
      storage_limit: storageLimit,
      delegate: (typeof delegate !== 'undefined' ? delegate : keys.pkh),
    }
    return rpc.sendOperation(from, operation, keys)
  },
  registerDelegate (keys, fee, gasLimit, storageLimit) {
    if (typeof gasLimit === 'undefined') gasLimit = '0'
    if (typeof storageLimit === 'undefined') storageLimit = '0'
    let operation = {
      kind: 'delegation',
      fee: fee.toString(),
      gas_limit: gasLimit,
      storage_limit: storageLimit,
      delegate: keys.pkh,
    }
    return rpc.sendOperation(keys.pkh, operation, keys)
  },
  typecheckCode (code) {
    let _code = utility.ml2mic(code)
    return node.query('/chains/main/blocks/head/helpers/scripts/typecheck_code', { program: _code, fee: '10000' })
  },
  packData (data, type) {
    let check = {
      data: utility.sexp2mic(data),
      type: utility.sexp2mic(type),
      fee: '400000',
    }
    return node.query('/chains/main/blocks/head/helpers/scripts/pack_data', check)
  },
  typecheckData (data, type) {
    let check = {
      data: utility.sexp2mic(data),
      type: utility.sexp2mic(type),
      fee: '400000',
    }
    return node.query('/chains/main/blocks/head/helpers/scripts/typecheck_data', check)
  },
  runCode (code, amount, input, storage, trace) {
    let ep = ((typeof trace !== 'undefined' && trace) ? 'trace_code' : 'run_code')
    return node.query(`/chains/main/blocks/head/helpers/scripts/${ep}`, {
      script: utility.ml2mic(code),
      amount: utility.mutez(amount).toString(),
      input: utility.sexp2mic(input),
      storage: utility.sexp2mic(storage),
    })
  },
}
const contract = {
  hash (operationHash, ind) {
    let ob = utility.b58cdecode(operationHash, prefix.o)
    let tt = []
    let i = 0
    for (; i < ob.length; i++) {
      tt.push(ob[i])
    }
    tt = tt.concat([
      (ind & 0xff000000) >> 24, // eslint-disable-line no-bitwise
      (ind & 0x00ff0000) >> 16, // eslint-disable-line no-bitwise
      (ind & 0x0000ff00) >> 8, // eslint-disable-line no-bitwise
      ind & 0x000000ff, // eslint-disable-line no-bitwise
    ])
    return utility.b58cencode(library.sodium.crypto_generichash(20, new Uint8Array(tt)), prefix.KT)
  },
  originate (keys, amount, code, init, spendable, delegatable, delegate, fee, gasLimit, storageLimit) {
    if (typeof gasLimit === 'undefined') gasLimit = '10000'
    if (typeof storageLimit === 'undefined') storageLimit = '10000'
    return rpc.originate(keys, amount, code, init, spendable, delegatable, delegate, fee, gasLimit, storageLimit)
  },
  send (toAddress, from, keys, amount, parameter, fee, gasLimit, storageLimit) {
    if (typeof gasLimit === 'undefined') gasLimit = '2000'
    if (typeof storageLimit === 'undefined') storageLimit = '0'
    return rpc.transfer(from, keys, toAddress, amount, fee, parameter, gasLimit, storageLimit)
  },
  balance (address) {
    return rpc.getBalance(address)
  },
  storage (contractArg) {
    return new Promise(((resolve, reject) => {
      node.query(`/chains/main/blocks/head/context/contracts/${contractArg}/storage`)
        .then((r) => {
          resolve(r)
        }).catch((e) => {
          reject(e)
        })
    }))
  },
  load (contractArg) {
    return node.query(`/chains/main/blocks/head/context/contracts/${contractArg}`)
  },
  watch (cc, timeout, cb) {
    let storage = []
    const ct = function () {
      contract.storage(cc).then((r) => {
        if (JSON.stringify(storage) !== JSON.stringify(r)) {
          storage = r
          cb(storage)
        }
      })
    }
    ct()
    return setInterval(ct, timeout * 1000)
  },
}

// Legacy
utility.ml2tzjson = utility.sexp2mic
utility.tzjson2arr = utility.mic2arr
utility.mlraw2json = utility.ml2mic
utility.mintotz = utility.totez
utility.tztomin = utility.mutez
prefix.TZ = new Uint8Array([2, 90, 121])

// Expose library
const eztz = {
  defaultProvider,
  library,
  prefix,
  watermark,
  utility,
  crypto,
  node,
  rpc,
  contract,
}

export default eztz
