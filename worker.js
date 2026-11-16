// Cloudflare Worker: GitHub Pages -> Worker -> Kakao 대중교통 REST API
// Settings > Variables and Secrets > Add > Secret: KAKAO_REST_API_KEY
// REST API 키는 index.html/GitHub에 절대로 넣지 마세요.
const ALLOWED_ORIGIN = 'https://affossoffa.github.io';
const endpoint = 'https://dapi.kakao.com/v2/routing/publictraffic';
const noStore = {'Cache-Control': 'no-store, max-age=0'};
function json(obj,status=200,origin=ALLOWED_ORIGIN){
  return new Response(JSON.stringify(obj),{
    status,
    headers:{'Content-Type':'application/json; charset=utf-8',
      'Access-Control-Allow-Origin':origin,
      'Vary':'Origin',...noStore},
  });
}
function numberParam(s,lo,hi){
  if(s===null||s.trim()==='')return null;
  const n=Number(s);
  return Number.isFinite(n)&&n>=lo&&n<=hi?n:null;
}
export default {
  async fetch(request,env){
    const origin=request.headers.get('Origin');
    if(origin!==ALLOWED_ORIGIN)return json({error:'허용되지 않은 웹사이트 요청입니다.'},403);
    const url=new URL(request.url);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{
      'Access-Control-Allow-Origin':ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods':'GET, OPTIONS',
      'Access-Control-Allow-Headers':'Content-Type',
      'Access-Control-Max-Age':'600',...noStore
    }});
    if(request.method!=='GET'||url.pathname!=='/transit')return json({error:'경로를 찾을 수 없습니다.'},404);
    if(!env.KAKAO_REST_API_KEY)return json({error:'Worker에 KAKAO_REST_API_KEY Secret이 없습니다.'},500);
    const coords={
      start_x:numberParam(url.searchParams.get('start_x'),124,132),
      start_y:numberParam(url.searchParams.get('start_y'),33,39.5),
      end_x:numberParam(url.searchParams.get('end_x'),124,132),
      end_y:numberParam(url.searchParams.get('end_y'),33,39.5)
    };
    if(Object.values(coords).some(v=>v===null))return json({error:'출발·도착 좌표가 올바르지 않습니다.'},400);
    const params=new URLSearchParams(coords);
    try{
      const response=await fetch(endpoint+'?'+params,{
        headers:{Authorization:'KakaoAK '+env.KAKAO_REST_API_KEY},
        cf:{cacheTtl:0,cacheEverything:false}
      });
      // 카카오 응답은 저장·캐싱하지 않습니다.
      const data=await response.json();
      if(!response.ok)return json({error:'카카오 API 오류 ('+response.status+')',detail:data?.msg||data?.message||null},response.status);
      if(data.status!=='OK')return json({status:data.status||'NO_RESULTS'});
      const routes=Array.isArray(data.routes)?data.routes:[];
      const best=routes.filter(r=>Number.isFinite(r?.properties?.totalTime)).sort((a,b)=>a.properties.totalTime-b.properties.totalTime)[0];
      if(!best)return json({status:'NO_RESULTS'});
      const props=best.properties;
      return json({status:'OK',totalTime:props.totalTime,
        transfers:props.transfers,routeType:props.type,
        fare:Number.isFinite(props.fare?.value)?props.fare.value:null});
    }catch(e){return json({error:'대중교통 API 연결 실패'},502);}
  }
};
