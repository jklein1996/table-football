// Relay transport: same interface as PeerJS, but every message goes through a WebSocket relay
// (window.TB_RELAY, set in js/relay-url.js), so phones on any network can reach each other.
(function(){
  function E(){ this._h={}; }
  E.prototype.on=function(e,f){ (this._h[e]=this._h[e]||[]).push(f); return this; };
  E.prototype.emit=function(e){ var a=[].slice.call(arguments,1); (this._h[e]||[]).slice().forEach(function(f){ try{ f.apply(null,a); }catch(x){ console.error(x); } }); };
  function Conn(peer,other,cid){ E.call(this); this.peer=peer; this.peerId=other; this.cid=cid; this.open=false; }
  Conn.prototype=Object.create(E.prototype);
  Conn.prototype.send=function(d){ if(this.open) this.peer._tx({t:"msg",cid:this.cid,d:d}); };
  Conn.prototype.close=function(){ var was=this.open; this.open=false; this.peer._tx({t:"close",cid:this.cid}); delete this.peer._conns[this.cid]; if(was) this.emit("close"); };
  function RelayPeer(id){ E.call(this); this._want=id||null; this.id=null; this.open=false; this.disconnected=false; this.destroyed=false; this._conns={}; this._q=[]; this._connect(); }
  RelayPeer.prototype=Object.create(E.prototype);
  RelayPeer.prototype._connect=function(){ var self=this, ws;
    if(this._ws&&this._ws.readyState<=1) return;
    try{ ws=new WebSocket(window.TB_RELAY); }catch(e){ setTimeout(function(){ self.emit("error",{type:"network"}); },0); return; }
    this._ws=ws;
    ws.onopen=function(){ ws.send(JSON.stringify({t:"reg",id:self._want})); };
    ws.onmessage=function(ev){ var m; try{ m=JSON.parse(ev.data); }catch(e){ return; } self._rx(m); };
    ws.onclose=function(){ if(self.destroyed||self._ws!==ws) return; var was=self.open; self.open=false; self.disconnected=true;
      Object.keys(self._conns).forEach(function(k){ var c=self._conns[k]; if(c.open){ c.open=false; c.emit("close"); } }); self._conns={};
      if(was) self.emit("disconnected"); else self.emit("error",{type:"network"});
      setTimeout(function(){ self.reconnect(); },2500); };
  };
  RelayPeer.prototype._tx=function(m){ if(this._ws&&this._ws.readyState===1) this._ws.send(JSON.stringify(m)); };
  RelayPeer.prototype._rx=function(m){ var self=this, c;
    if(m.t==="open"){ this.id=m.id; this._want=m.id; this.open=true; this.disconnected=false; this.emit("open",m.id); var q=this._q; this._q=[]; q.forEach(function(x){ self._tx(x); }); return; }
    if(m.t==="err"){ if(m.type==="peer-unavailable"){ delete this._conns[m.cid]; } this.emit("error",{type:m.type}); return; }
    if(m.t==="conn"){ c=new Conn(this,m.from,m.cid); this._conns[m.cid]=c; this.emit("connection",c); this._tx({t:"connok",cid:m.cid}); c.open=true; c.emit("open"); return; }
    if(m.t==="connok"){ c=this._conns[m.cid]; if(c&&!c.open){ c.open=true; c.emit("open"); } return; }
    if(m.t==="msg"){ c=this._conns[m.cid]; if(c&&c.open) c.emit("data",m.d); return; }
    if(m.t==="close"){ c=this._conns[m.cid]; if(c){ delete this._conns[m.cid]; if(c.open){ c.open=false; c.emit("close"); } } }
  };
  RelayPeer.prototype.connect=function(to){ var cid=Math.random().toString(36).slice(2,12); var c=new Conn(this,to,cid); this._conns[cid]=c; var m={t:"conn",to:to,cid:cid}; if(this.open) this._tx(m); else this._q.push(m); return c; };
  RelayPeer.prototype.reconnect=function(){ if(this.destroyed||this.open) return; this._connect(); };
  RelayPeer.prototype.destroy=function(){ this.destroyed=true; this.open=false; var self=this; Object.keys(this._conns).forEach(function(k){ try{ self._conns[k].close(); }catch(e){} }); try{ this._ws&&this._ws.close(); }catch(e){} };
  window.RelayPeer=RelayPeer;
})();
