import { Hono } from "npm:hono@3";
import { cors } from "npm:hono@3/cors";
import { logger } from "npm:hono@3/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// 서버 시작 시 test 계정 자동 생성
async function initializeTestAccount() {
  try {
    console.log('=== test 계정 초기화 시작 ===');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // test 계정이 이미 존재하는지 확인
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log('사용자 목록 조회 오류:', listError);
      return;
    }

    const testUser = users?.find(u => u.user_metadata?.userId === 'test');
    
    if (testUser) {
      console.log('test 계정이 이미 존재합니다:', testUser.id);
      return;
    }

    // test 계정 생성
    console.log('test 계정 생성 중...');
    const email = 'test@durudurup.local';
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: '123456',
      user_metadata: { 
        userId: 'test',
        nickname: '테스트유저',
        gender: 'male',
        address: '서울시',
        profileImage: null
      },
      email_confirm: true
    });

    if (error) {
      console.log('test 계정 생성 오류:', error);
      return;
    }

    // KV Store에 사용자 정보 저장
    await kv.set(`user:${data.user.id}`, {
      userId: 'test',
      nickname: '테스트유저',
      gender: 'male',
      address: '서울시',
      profileImage: null,
      isAdmin: false,
      isSubscribed: true, // 프리미엄 구독 자동 부여
      createdAt: new Date().toISOString(),
    });

    // communityId '1'(독서 모임)에 리더로 자동 등록
    await kv.set(`community:1:member:${data.user.id}`, {
      userId: data.user.id,
      nickname: '테스트유저',
      email: email,
      status: 'approved',
      role: 'leader',
      requestedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
    });

    console.log('test 계정 생성 완료:', data.user.id);
    console.log('이메일: test, 비밀번호: 123456');

  } catch (error) {
    console.log('test 계정 초기화 오류:', error);
  }
}

// 서버 시작 시 test 계정 초기화 실행
initializeTestAccount();

// Health check endpoint
app.get("/make-server-12a2c4b5/health", (c) => {
  return c.json({ status: "ok" });
});

// test 계정 생성 전용 엔드포인트
app.post("/make-server-12a2c4b5/init-test-account", async (c) => {
  try {
    console.log('=== test 계정 생성 요청 ===');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // test 계정이 이미 존재하는지 확인
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log('사용자 목록 조회 오류:', listError);
      return c.json({ success: false, error: '사용자 목록 조회 실패' }, 500);
    }

    const testUser = users?.find(u => u.user_metadata?.userId === 'test');
    
    if (testUser) {
      console.log('test 계정이 이미 존재합니다:', testUser.id);
      return c.json({ 
        success: true, 
        message: 'test 계정이 이미 존재합니다.',
        userId: testUser.id 
      });
    }

    // test 계정 생성
    console.log('test 계정 생성 중...');
    const email = 'test@durudurup.local';
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: '123456',
      user_metadata: { 
        userId: 'test',
        nickname: '테스트유저',
        gender: 'male',
        address: '서울시',
        profileImage: null
      },
      email_confirm: true
    });

    if (error) {
      console.log('test 계정 생성 오류:', error);
      return c.json({ success: false, error: error.message }, 500);
    }

    // KV Store에 사용자 정보 저장
    await kv.set(`user:${data.user.id}`, {
      userId: 'test',
      nickname: '테스트유저',
      gender: 'male',
      address: '서울시',
      profileImage: null,
      isAdmin: false,
      isSubscribed: true, // 프리미엄 구독 자동 부여
      createdAt: new Date().toISOString(),
    });

    // communityId '1'(독서 모임)에 리더로 자동 등록
    await kv.set(`community:1:member:${data.user.id}`, {
      userId: data.user.id,
      nickname: '테스트유저',
      email: email,
      status: 'approved',
      role: 'leader',
      requestedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
    });

    console.log('test 계정 생성 완료:', data.user.id);
    console.log('이메일: test, 비밀번호: 123456');

    return c.json({ 
      success: true, 
      message: 'test 계정이 생성되었습니다. (이메일: test, 비밀번호: 123456)',
      userId: data.user.id 
    });

  } catch (error) {
    console.log('test 계정 생성 오류:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 회원가입 endpoint
app.post("/make-server-12a2c4b5/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, password, nickname, gender, address, profileImage } = body;

    // Supabase Admin Client 생성 (SERVICE_ROLE_KEY 사용)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Supabase Auth를 사용하여 사용자 생성
    // userId를 이메일 형식으로 변환 (Supabase는 이메일 기반 인증 사용)
    const email = `${userId}@durudurup.local`;
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: { 
        userId: userId,
        nickname: nickname,
        gender: gender,
        address: address,
        profileImage: profileImage 
      },
      // 이메일 서버가 설정되지 않았으므로 자동으로 이메일 확인
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ success: false, error: error.message }, 400);
    }

    // 사용자 추가 정보를 KV Store에 저장
    // 특정 userId가 'admin'이면 관리자로 설정
    const isAdmin = userId === 'admin';
    // 특정 userId가 'test'면 프리미엄 구독 상태로 설정
    const isSubscribed = userId === 'test';
    
    await kv.set(`user:${data.user.id}`, {
      userId,
      nickname,
      gender,
      address,
      profileImage,
      isAdmin: isAdmin, // 'admin' userId는 관리자로 설정
      isSubscribed: isSubscribed, // 'test' userId는 프리미엄 구독자로 설정
      createdAt: new Date().toISOString(),
    });

    return c.json({ 
      success: true, 
      message: '회원가입이 완료되었습니다.',
      userId: data.user.id 
    });

  } catch (error) {
    console.log('Signup server error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 이메일 중복 체크 endpoint
app.post("/make-server-12a2c4b5/check-email", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    // 모든 사용자 정보를 가져와서 이메일 중복 체크
    const allUsers = await kv.getByPrefix('user:');
    const isDuplicate = allUsers.some((user: any) => user.userId === email);

    return c.json({
      available: !isDuplicate
    });

  } catch (error) {
    console.log('Email check error:', error);
    return c.json({ 
      available: false,
      error: '중복 체크 중 오류가 발생했습니다.' 
    }, 500);
  }
});

// 닉네임 중복 체크 endpoint
app.post("/make-server-12a2c4b5/check-nickname", async (c) => {
  try {
    const body = await c.req.json();
    const { nickname } = body;

    // 모든 사용자 정보를 가져와서 닉네임 중복 체크
    const allUsers = await kv.getByPrefix('user:');
    const isDuplicate = allUsers.some((user: any) => user.nickname === nickname);

    return c.json({
      available: !isDuplicate
    });

  } catch (error) {
    console.log('Nickname check error:', error);
    return c.json({ 
      available: false,
      error: '중복 체크 중 오류가 발생했습니다.' 
    }, 500);
  }
});

// 로그인 endpoint
app.post("/make-server-12a2c4b5/login", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, password } = body;

    // Supabase Client 생성 (ANON_KEY 사용)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // userId를 이메일 형식으로 변환
    const email = `${userId}@durudurup.local`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.log('Login error:', error);
      return c.json({ 
        success: false, 
        error: '아이디 또는 비밀번호가 올바르지 않습니다.' 
      }, 401);
    }

    // KV Store에서 사용자 추가 정보 가져오기
    const userInfo = await kv.get(`user:${data.user.id}`);

    return c.json({ 
      success: true, 
      message: '로그인 성공',
      accessToken: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        ...userInfo,
      }
    });

  } catch (error) {
    console.log('Login server error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 로그아웃 endpoint
app.post("/make-server-12a2c4b5/logout", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { error } = await supabase.auth.admin.signOut(accessToken);

    if (error) {
      console.log('Logout error:', error);
      return c.json({ success: false, error: error.message }, 400);
    }

    return c.json({ success: true, message: '로그아웃 되었습니다.' });

  } catch (error) {
    console.log('Logout server error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 현재 사용자 정보 가져오기 endpoint
app.get("/make-server-12a2c4b5/me", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ success: false, error: '인증에 실패했습니다.' }, 401);
    }

    // KV Store에서 사용자 추가 정보 가져오기
    const userInfo = await kv.get(`user:${user.id}`);

    return c.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        ...userInfo,
      }
    });

  } catch (error) {
    console.log('Get user info error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 모임 가입 신청
app.post("/make-server-12a2c4b5/communities/:communityId/join", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ success: false, error: '인증에 실패했습니다.' }, 401);
    }

    const communityId = c.req.param('communityId');
    
    // 사용자 정보 가져오기
    const userInfo = await kv.get(`user:${user.id}`);
    
    // 이미 가입 신청을 했는지 확인
    const existingMembership = await kv.get(`community:${communityId}:member:${user.id}`);
    if (existingMembership) {
      return c.json({ 
        success: false, 
        error: '이미 가입 신청을 하셨습니다.',
        status: existingMembership.status
      }, 400);
    }

    // 가입 신청 정보 저장
    const membershipData = {
      userId: user.id,
      nickname: userInfo?.nickname || user.email?.split('@')[0] || '익명',
      email: user.email,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    await kv.set(`community:${communityId}:member:${user.id}`, membershipData);

    return c.json({ 
      success: true, 
      message: '가입 신청이 완료되었습니다.',
      status: 'pending'
    });

  } catch (error) {
    console.log('Join community error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 멤버십 상태 조회
app.get("/make-server-12a2c4b5/communities/:communityId/membership", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: true, status: 'none' });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ success: true, status: 'none' });
    }

    // test 계정은 주말 축구 모임(communityId: 1)에 자동 승인된 멤버로 처리
    const communityId = c.req.param('communityId');
    const userInfo = await kv.get(`user:${user.id}`);
    
    if (userInfo?.userId === 'test' && communityId === '1') {
      return c.json({ 
        success: true, 
        status: 'approved',
        data: {
          userId: user.id,
          nickname: userInfo?.nickname || 'test',
          status: 'approved',
          requestedAt: '2026-01-20T00:00:00.000Z',
          approvedAt: '2026-01-20T00:00:00.000Z',
        }
      });
    }

    const membership = await kv.get(`community:${communityId}:member:${user.id}`);

    return c.json({ 
      success: true, 
      status: membership?.status || 'none',
      data: membership
    });

  } catch (error) {
    console.log('Get membership status error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 가입 신청 목록 조회 (리더 전용)
app.get("/make-server-12a2c4b5/communities/:communityId/join-requests", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ success: false, error: '인증에 실패했습니다.' }, 401);
    }

    const communityId = c.req.param('communityId');
    
    // 리더 권한 확인 (실제로는 community 데이터에서 leaderId를 확인해야 함)
    // 지금은 간단히 구현
    
    // 모든 멤버십 정보 가져오기
    const allMemberships = await kv.getByPrefix(`community:${communityId}:member:`);
    
    // pending 상태인 것만 필터링
    const pendingRequests = allMemberships.filter((m: any) => m.status === 'pending');

    return c.json({ 
      success: true, 
      requests: pendingRequests
    });

  } catch (error) {
    console.log('Get join requests error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 가입 승인 (리더 전용)
app.post("/make-server-12a2c4b5/communities/:communityId/join-requests/:userId/approve", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ success: false, error: '인증에 실패했습니다.' }, 401);
    }

    const communityId = c.req.param('communityId');
    const targetUserId = c.req.param('userId');
    
    // 멤버십 정보 가져오기
    const membership = await kv.get(`community:${communityId}:member:${targetUserId}`);
    
    if (!membership) {
      return c.json({ success: false, error: '가입 신청을 찾을 수 없습니다.' }, 404);
    }

    // 승인으로 상태 변경
    const updatedMembership = {
      ...membership,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: user.id,
    };

    await kv.set(`community:${communityId}:member:${targetUserId}`, updatedMembership);

    return c.json({ 
      success: true, 
      message: '가입이 승인되었습니다.'
    });

  } catch (error) {
    console.log('Approve join request error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 가입 거부 (리더 전용)
app.post("/make-server-12a2c4b5/communities/:communityId/join-requests/:userId/reject", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ success: false, error: '인증에 실패했습니다.' }, 401);
    }

    const communityId = c.req.param('communityId');
    const targetUserId = c.req.param('userId');
    
    // 가입 신청 삭제
    await kv.del(`community:${communityId}:member:${targetUserId}`);

    return c.json({ 
      success: true, 
      message: '가입이 거부되었습니다.'
    });

  } catch (error) {
    console.log('Reject join request error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 모임 생성
app.post("/make-server-12a2c4b5/communities", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.log('Create community auth error:', userError);
      return c.json({ 
        success: false, 
        error: '사용자 인증에 실패했습니다.' 
      }, 401);
    }

    // 차단된 사용자인지 확인
    const blockStatus = await checkUserBlocked(user.id);
    if (blockStatus.isBlocked) {
      return c.json({ 
        success: false, 
        error: blockStatus.message || '차단된 사용자는 모임을 생성할 수 없습니다.' 
      }, 403);
    }

    // 사용자 정보 가져오기
    const userInfo = await kv.get(`user:${user.user_metadata.userId}`);
    
    if (!userInfo) {
      return c.json({ 
        success: false, 
        error: '사용자 정보를 찾을 수 없습니다.' 
      }, 404);
    }

    const body = await c.req.json();
    const { title, description, category, location, maxMembers } = body;

    // 모임 ID 생성
    const communityId = `community_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 모임 정보 저장
    const communityData = {
      id: communityId,
      title,
      description,
      category,
      location,
      hostId: user.user_metadata.userId,
      hostName: userInfo.nickname,
      maxMembers,
      memberCount: 1, // 호스트가 첫 멤버
      createdAt: new Date().toISOString(),
    };

    await kv.set(`community:${communityId}`, communityData);

    // 호스트를 승인된 멤버로 추가
    await kv.set(`membership:${communityId}:${user.user_metadata.userId}`, {
      userId: user.user_metadata.userId,
      communityId: communityId,
      status: 'approved',
      joinedAt: new Date().toISOString(),
      role: 'host'
    });

    return c.json({
      success: true,
      community: communityData,
      message: '모임이 생성되었습니다.'
    });

  } catch (error) {
    console.log('Create community error:', error);
    return c.json({ 
      success: false, 
      error: `모임 생성 중 오류가 발생했습니다: ${error.message}` 
    }, 500);
  }
});

// 모임 목록 조회
app.get("/make-server-12a2c4b5/communities", async (c) => {
  try {
    // 모든 모임 가져오기
    const allCommunities = await kv.getByPrefix('community:');

    return c.json({
      success: true,
      communities: allCommunities.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });

  } catch (error) {
    console.log('Get communities error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 즐겨찾기 상태 조회
app.get("/make-server-12a2c4b5/communities/:communityId/favorite", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: true, isFavorite: false });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ success: true, isFavorite: false });
    }

    const communityId = c.req.param('communityId');
    const userFavorites = await kv.get(`user:${user.id}:favorites`) || [];

    return c.json({ 
      success: true, 
      isFavorite: userFavorites.includes(communityId)
    });

  } catch (error) {
    console.log('Get favorite status error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 즐겨찾기 토글 (추가/제거)
app.post("/make-server-12a2c4b5/communities/:communityId/favorite", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ success: false, error: '인증에 실패했습니다.' }, 401);
    }

    const communityId = c.req.param('communityId');

    // 사용자의 즐겨찾기 목록 가져오기
    let userFavorites = await kv.get(`user:${user.id}:favorites`) || [];

    // 즐겨찾기 토글
    const isFavorited = userFavorites.includes(communityId);
    
    if (isFavorited) {
      // 제거
      userFavorites = userFavorites.filter((id: string) => id !== communityId);
    } else {
      // 추가
      userFavorites.push(communityId);
    }

    // 업데이트된 즐겨찾기 목록 저장
    await kv.set(`user:${user.id}:favorites`, userFavorites);

    console.log('즐겨찾기 토글 완료:', { userId: user.id, communityId, isFavorite: !isFavorited });

    return c.json({
      success: true,
      isFavorite: !isFavorited,
      message: isFavorited ? '즐겨찾기에서 제거되었습니다.' : '즐겨찾기에 추가되었습니다.'
    });

  } catch (error) {
    console.log('Toggle favorite error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// ============ 관리자 API ============

// 관리자 권한 확인 헬퍼 함수
async function checkAdminAccess(accessToken: string) {
  // ANON_KEY를 사용하여 토큰 검증 (사용자 토큰은 ANON_KEY로 생성됨)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    console.log('관리자 권한 확인 - 인증 실패:', error);
    return { isAdmin: false, user: null, error: '인증에 실패했습니다.' };
  }

  // KV Store에서 사용자 정보 가져오기
  const userInfo = await kv.get(`user:${user.id}`);
  
  console.log('관리자 권한 확인 - 사용자 정보:', userInfo);
  
  // isAdmin 플래그 확인
  const isAdmin = userInfo?.isAdmin === true;

  if (!isAdmin) {
    console.log('관리자 권한 확인 - 관리자 권한 없음');
    return { isAdmin: false, user: null, error: '관리자 권한이 필요합니다.' };
  }

  console.log('관리자 권한 확인 - 성공');
  return { isAdmin: true, user, error: null };
}

// 관리자 대시보드 통계
app.get("/make-server-12a2c4b5/admin/stats", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const { isAdmin, error } = await checkAdminAccess(accessToken);
    if (!isAdmin) {
      return c.json({ success: false, error }, 403);
    }

    // 모든 사용자 수
    const allUsers = await kv.getByPrefix('user:');
    const totalUsers = allUsers.length;

    // 모든 모임 수
    const allCommunities = await kv.getByPrefix('community:');
    // community:id 형식만 카운트 (community:id:member:userId 제외)
    const totalCommunities = allCommunities.filter((item: any) => 
      item && typeof item === 'object' && item.id && item.title
    ).length;

    // 모든 멤버십 수
    const allMemberships = await kv.getByPrefix('community:');
    const totalMembers = allMemberships.filter((item: any) => 
      item && typeof item === 'object' && item.status === 'approved'
    ).length;

    // 모든 신고 수
    const allReports = await kv.getByPrefix('report:');
    const totalReports = allReports.length;

    return c.json({
      success: true,
      stats: {
        totalUsers,
        totalCommunities,
        totalMembers,
        totalReports
      }
    });

  } catch (error) {
    console.log('Get admin stats error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 관리자 모임 목록 조회
app.get("/make-server-12a2c4b5/admin/communities", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const { isAdmin, error } = await checkAdminAccess(accessToken);
    if (!isAdmin) {
      return c.json({ success: false, error }, 403);
    }

    // 모든 모임 가져오기
    const allData = await kv.getByPrefix('community:');
    const communities = allData.filter((item: any) => 
      item && typeof item === 'object' && item.id && item.title
    );

    return c.json({
      success: true,
      communities
    });

  } catch (error) {
    console.log('Get admin communities error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 관리자 모임 삭제
app.delete("/make-server-12a2c4b5/admin/communities/:communityId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const { isAdmin, error } = await checkAdminAccess(accessToken);
    if (!isAdmin) {
      return c.json({ success: false, error }, 403);
    }

    const communityId = c.req.param('communityId');

    // 모임 삭제
    await kv.del(`community:${communityId}`);

    // 관련 멤버십도 삭제
    const allMemberships = await kv.getByPrefix(`community:${communityId}:member:`);
    for (const membership of allMemberships) {
      if (membership && membership.userId) {
        await kv.del(`community:${communityId}:member:${membership.userId}`);
      }
    }

    return c.json({
      success: true,
      message: '모임이 삭제되었습니다.'
    });

  } catch (error) {
    console.log('Delete community error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 관리자 사용자 목록 조회
app.get("/make-server-12a2c4b5/admin/users", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const { isAdmin, error } = await checkAdminAccess(accessToken);
    if (!isAdmin) {
      return c.json({ success: false, error }, 403);
    }

    // 모든 사용자 가져오기
    const allUsers = await kv.getByPrefix('user:');
    
    // userId를 키에서 추출
    const users = allUsers.map((userData: any, index: number) => {
      // user:userId 형식에서 userId 추출
      const keys = Object.keys(userData || {});
      return {
        id: `user-${index}`,
        userId: userData?.userId || '알 수 없음',
        nickname: userData?.nickname || '알 수 없음',
        createdAt: userData?.createdAt || new Date().toISOString()
      };
    });

    return c.json({
      success: true,
      users
    });

  } catch (error) {
    console.log('Get admin users error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 관리자 사용자 정지
app.post("/make-server-12a2c4b5/admin/users/:userId/suspend", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const { isAdmin, error } = await checkAdminAccess(accessToken);
    if (!isAdmin) {
      return c.json({ success: false, error }, 403);
    }

    const userId = c.req.param('userId');

    // 사용자 정지 처리 (실제로는 Supabase Auth에서 사용자를 비활성화하거나 메타데이터에 상태 추가)
    const userInfo = await kv.get(`user:${userId}`);
    
    if (!userInfo) {
      return c.json({ success: false, error: '사용자를 찾을 수 없습니다.' }, 404);
    }

    // 정지 상태 추가
    await kv.set(`user:${userId}`, {
      ...userInfo,
      suspended: true,
      suspendedAt: new Date().toISOString()
    });

    return c.json({
      success: true,
      message: '사용자가 정지되었습니다.'
    });

  } catch (error) {
    console.log('Suspend user error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 관리자 신고 목록 조회
app.get("/make-server-12a2c4b5/admin/reports", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const { isAdmin, error } = await checkAdminAccess(accessToken);
    if (!isAdmin) {
      return c.json({ success: false, error }, 403);
    }

    // 모든 신고 가져오기
    const allReports = await kv.getByPrefix('report:');

    return c.json({
      success: true,
      reports: allReports
    });

  } catch (error) {
    console.log('Get admin reports error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 관리자 신고 처리 완료
app.post("/make-server-12a2c4b5/admin/reports/:reportId/resolve", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const { isAdmin, error } = await checkAdminAccess(accessToken);
    if (!isAdmin) {
      return c.json({ success: false, error }, 403);
    }

    const reportId = c.req.param('reportId');
    const report = await kv.get(`report:${reportId}`);

    if (!report) {
      return c.json({ success: false, error: '신고를 찾을 수 없습니다.' }, 404);
    }

    // 신고 상태 업데이트
    await kv.set(`report:${reportId}`, {
      ...report,
      status: 'resolved',
      resolvedAt: new Date().toISOString()
    });

    return c.json({
      success: true,
      message: '신고가 처리되었습니다.'
    });

  } catch (error) {
    console.log('Resolve report error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 관리자 신고 기각
app.post("/make-server-12a2c4b5/admin/reports/:reportId/dismiss", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const { isAdmin, error } = await checkAdminAccess(accessToken);
    if (!isAdmin) {
      return c.json({ success: false, error }, 403);
    }

    const reportId = c.req.param('reportId');
    const report = await kv.get(`report:${reportId}`);

    if (!report) {
      return c.json({ success: false, error: '신고를 찾을 수 없습니다.' }, 404);
    }

    // 신고 상태 업데이트
    await kv.set(`report:${reportId}`, {
      ...report,
      status: 'dismissed',
      dismissedAt: new Date().toISOString()
    });

    return c.json({
      success: true,
      message: '신고가 기각되었습니다.'
    });

  } catch (error) {
    console.log('Dismiss report error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 관리자 사용자 차단
app.post("/make-server-12a2c4b5/admin/users/:userId/block", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const { isAdmin, user: adminUser, error } = await checkAdminAccess(accessToken);
    if (!isAdmin) {
      return c.json({ success: false, error }, 403);
    }

    const targetUserId = c.req.param('userId');
    const body = await c.req.json();
    const { blockType, blockDays } = body;

    // 모든 사용자 정보를 가져와서 targetUserId와 매칭되는 실제 Supabase UUID 찾기
    const allUsers = await kv.getByPrefix('user:');
    let actualUserKey = null;
    let userInfo = null;

    // user: prefix를 가진 모든 키에서 일치하는 사용자 찾기
    for (const userData of allUsers) {
      if (userData && (userData.userId === targetUserId || userData.id === targetUserId)) {
        userInfo = userData;
        break;
      }
    }

    // 직접 키로도 시도
    if (!userInfo) {
      userInfo = await kv.get(`user:${targetUserId}`);
    }

    // userId로 실제 Supabase 사용자 UUID 기
    if (!userInfo) {
      // Supabase에서 모든 사용자 조회하여 매칭
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      // admin API로 모든 사용자 목록 가져오기
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      
      if (!listError && users) {
        const matchedUser = users.find(u => 
          u.user_metadata?.userId === targetUserId || 
          u.id === targetUserId
        );
        
        if (matchedUser) {
          actualUserKey = matchedUser.id;
          userInfo = await kv.get(`user:${matchedUser.id}`);
        }
      }
    } else {
      // KV store에서 사용자의 실제 UUID를 찾기 위해 모든 user: 키 확인
      const allUserKeys = await kv.getByPrefix('user:');
      for (let i = 0; i < allUserKeys.length; i++) {
        const userData = allUserKeys[i];
        if (userData && userData.userId === (userInfo.userId || targetUserId)) {
          // 키 형식: user:{uuid}
          // KV store의 키를 직접 가져올 수 없으므로, userId를 기반으로 차단 키 생성
          actualUserKey = targetUserId;
          break;
        }
      }
    }

    if (!userInfo) {
      return c.json({ success: false, error: '사용자를 찾을 수 없습다.' }, 404);
    }

    // 차단 정보 생성
    const blockData: any = {
      userId: actualUserKey || targetUserId,
      userIdString: userInfo.userId || targetUserId,
      blockType,
      blockedAt: new Date().toISOString(),
      blockedBy: adminUser?.id,
    };

    if (blockType === 'temporary' && blockDays) {
      // 차단 종료일 계산
      const blockEndDate = new Date();
      blockEndDate.setDate(blockEndDate.getDate() + blockDays);
      blockData.blockEndDate = blockEndDate.toISOString();
      blockData.blockDays = blockDays;
    }

    // 차단 정보 저장 - userId와 실제 UUID 모두로 저장
    await kv.set(`blocked:${actualUserKey || targetUserId}`, blockData);
    if (userInfo.userId && userInfo.userId !== targetUserId) {
      await kv.set(`blocked:${userInfo.userId}`, blockData);
    }

    console.log(`사용자 ${targetUserId}가 ${blockType} 차단되었습니다.`, blockData);

    return c.json({
      success: true,
      message: '사용자가 차단되었습니다.',
      blockData
    });

  } catch (error) {
    console.log('Block user error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 사용자 차단 상태 확인
app.get("/make-server-12a2c4b5/users/:userId/block-status", async (c) => {
  try {
    const userId = c.req.param('userId');
    const blockData = await kv.get(`blocked:${userId}`);

    if (!blockData) {
      return c.json({
        success: true,
        isBlocked: false
      });
    }

    // 임시 차단인 경우 종료일 확인
    if (blockData.blockType === 'temporary' && blockData.blockEndDate) {
      const now = new Date();
      const endDate = new Date(blockData.blockEndDate);

      if (now > endDate) {
        // 차단 기간이 지났으면 차단 해제
        await kv.del(`blocked:${userId}`);
        return c.json({
          success: true,
          isBlocked: false
        });
      }
    }

    return c.json({
      success: true,
      isBlocked: true,
      blockData
    });

  } catch (error) {
    console.log('Get block status error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 차단된 사용자인지 확인하는 헬퍼 함수
async function checkUserBlocked(userId: string) {
  const blockData = await kv.get(`blocked:${userId}`);

  if (!blockData) {
    return { isBlocked: false };
  }

  // 임시 차단인 경우 종료일 확인
  if (blockData.blockType === 'temporary' && blockData.blockEndDate) {
    const now = new Date();
    const endDate = new Date(blockData.blockEndDate);

    if (now > endDate) {
      // 차단 기간이 지났으면 차단 해제
      await kv.del(`blocked:${userId}`);
      return { isBlocked: false };
    }
  }

  return { 
    isBlocked: true, 
    blockData,
    message: blockData.blockType === 'permanent' 
      ? '영구 차단된 사용자입니다.' 
      : `${new Date(blockData.blockEndDate).toLocaleDateString('ko-KR')}까지 차단된 사용자입니다.`
  };
}

// 관리자 공지사항 목록 조회
app.get("/make-server-12a2c4b5/admin/notices", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const { isAdmin, error } = await checkAdminAccess(accessToken);
    if (!isAdmin) {
      return c.json({ success: false, error }, 403);
    }

    // 모든 공지사항 가져오기
    const allNotices = await kv.getByPrefix('notice:');

    return c.json({
      success: true,
      notices: allNotices.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });

  } catch (error) {
    console.log('Get admin notices error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 관리자 질문 목록 조회
app.get("/make-server-12a2c4b5/admin/questions", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const { isAdmin, error } = await checkAdminAccess(accessToken);
    if (!isAdmin) {
      return c.json({ success: false, error }, 403);
    }

    // 모든 질문 가져오기
    const allQuestions = await kv.getByPrefix('question:');

    return c.json({
      success: true,
      questions: allQuestions.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });

  } catch (error) {
    console.log('Get admin questions error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 관리자 게시글 목록 조회 (콘텐츠 관리)
app.get("/make-server-12a2c4b5/admin/posts", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const { isAdmin, error } = await checkAdminAccess(accessToken);
    if (!isAdmin) {
      return c.json({ success: false, error }, 403);
    }

    // 모든 게시글 가져오기
    const allPosts = await kv.getByPrefix('post:');

    return c.json({
      success: true,
      posts: allPosts.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });

  } catch (error) {
    console.log('Get admin posts error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 관리자 게시글 숨김/공개
app.post("/make-server-12a2c4b5/admin/posts/:postId/toggle-visibility", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const { isAdmin, error } = await checkAdminAccess(accessToken);
    if (!isAdmin) {
      return c.json({ success: false, error }, 403);
    }

    const postId = c.req.param('postId');
    const post = await kv.get(`post:${postId}`);

    if (!post) {
      return c.json({ success: false, error: '게시글을 찾을 수 없습니다.' }, 404);
    }

    // 게시글 숨김/공개 상태 토글
    await kv.set(`post:${postId}`, {
      ...post,
      isHidden: !post.isHidden,
      updatedAt: new Date().toISOString()
    });

    return c.json({
      success: true,
      message: post.isHidden ? '게시글이 공개되었습니다.' : '게시글이 숨김 처리되었습니다.'
    });

  } catch (error) {
    console.log('Toggle post visibility error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 관리자 게시글 삭제
app.delete("/make-server-12a2c4b5/admin/posts/:postId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const { isAdmin, error } = await checkAdminAccess(accessToken);
    if (!isAdmin) {
      return c.json({ success: false, error }, 403);
    }

    const postId = c.req.param('postId');
    await kv.del(`post:${postId}`);

    return c.json({
      success: true,
      message: '게시글이 삭제되었습니다.'
    });

  } catch (error) {
    console.log('Delete post error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 관리자 사용자 권한 변경
app.post("/make-server-12a2c4b5/admin/users/:userId/role", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const { isAdmin, error } = await checkAdminAccess(accessToken);
    if (!isAdmin) {
      return c.json({ success: false, error }, 403);
    }

    const userId = c.req.param('userId');
    const body = await c.req.json();
    const { role } = body;

    const userInfo = await kv.get(`user:${userId}`);
    
    if (!userInfo) {
      return c.json({ success: false, error: '사용자를 찾을 수 없습니다.' }, 404);
    }

    // 권한 업데이트
    await kv.set(`user:${userId}`, {
      ...userInfo,
      role: role,
      roleUpdatedAt: new Date().toISOString()
    });

    return c.json({
      success: true,
      message: '사용자 권한이 변경되었습니다.'
    });

  } catch (error) {
    console.log('Change user role error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// ============ 공지사항 API ============

// 공지사항 목록 조회 (전체 사용자)
app.get("/make-server-12a2c4b5/notices", async (c) => {
  try {
    // 모든 공지사항 가져오기
    const allNotices = await kv.getByPrefix('notice:');

    return c.json({
      success: true,
      notices: allNotices.sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    });

  } catch (error) {
    console.log('Get notices error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 공지사항 작성 (관리자 전용)
app.post("/make-server-12a2c4b5/notices", async (c) => {
  try {
    console.log('=== 공지사항 작성 요청 시작 ===');
    
    const authHeader = c.req.header('Authorization');
    console.log('Authorization 헤더:', authHeader ? '존재함' : '없음');
    
    const accessToken = authHeader?.split(' ')[1];
    console.log('추출된 토큰:', accessToken ? `${accessToken.substring(0, 20)}...` : '없음');

    if (!accessToken) {
      console.log('토큰 없음 - 401 반환');
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    console.log('관리자 권한 확인 시작...');
    const { isAdmin, error } = await checkAdminAccess(accessToken);
    console.log('관리자 권한 확인 결과:', { isAdmin, error });
    
    if (!isAdmin) {
      console.log('관리자 권한 없음 - 403 반환:', error);
      return c.json({ success: false, error }, 403);
    }

    const body = await c.req.json();
    const { title, content, category, isImportant } = body;
    
    console.log('공지사항 데이터:', { title, category, isImportant });

    // 공지사항 ID 생성
    const noticeId = Date.now();

    // 공지사항 저장
    const noticeData = {
      id: noticeId,
      title,
      content,
      category,
      isImportant: isImportant || false,
      date: new Date().toISOString().split('T')[0],
      views: 0,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`notice:${noticeId}`, noticeData);
    
    console.log('공지사항 작성 성공:', noticeId);

    return c.json({
      success: true,
      notice: noticeData,
      message: '공지사항이 작성되었습니다.'
    });

  } catch (error) {
    console.log('Create notice error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 공지사항 수정 (관리자 전용)
app.put("/make-server-12a2c4b5/notices/:noticeId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const { isAdmin, error } = await checkAdminAccess(accessToken);
    if (!isAdmin) {
      return c.json({ success: false, error }, 403);
    }

    const noticeId = c.req.param('noticeId');
    const body = await c.req.json();
    const { title, content, category, isImportant } = body;

    const existingNotice = await kv.get(`notice:${noticeId}`);
    
    if (!existingNotice) {
      return c.json({ success: false, error: '공지사항을 찾을 수 없습니다.' }, 404);
    }

    // 공지사항 업데이트
    const updatedNotice = {
      ...existingNotice,
      title,
      content,
      category,
      isImportant: isImportant || false,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`notice:${noticeId}`, updatedNotice);

    return c.json({
      success: true,
      notice: updatedNotice,
      message: '공지사항이 수정되었습니다.'
    });

  } catch (error) {
    console.log('Update notice error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 공지사항 삭제 (관리자 전용)
app.delete("/make-server-12a2c4b5/notices/:noticeId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ success: false, error: '인증 토큰이 필요합니다.' }, 401);
    }

    const { isAdmin, error } = await checkAdminAccess(accessToken);
    if (!isAdmin) {
      return c.json({ success: false, error }, 403);
    }

    const noticeId = c.req.param('noticeId');
    
    // 공지사항 삭제
    await kv.del(`notice:${noticeId}`);

    return c.json({
      success: true,
      message: '공지사항이 삭제되었습니다.'
    });

  } catch (error) {
    console.log('Delete notice error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 공지사항 조회수 증가
app.post("/make-server-12a2c4b5/notices/:noticeId/view", async (c) => {
  try {
    const noticeId = c.req.param('noticeId');
    const notice = await kv.get(`notice:${noticeId}`);

    if (!notice) {
      return c.json({ success: false, error: '공지사항을 찾을 수 없습니다.' }, 404);
    }

    // 조회수 증가
    const updatedNotice = {
      ...notice,
      views: (notice.views || 0) + 1,
    };

    await kv.set(`notice:${noticeId}`, updatedNotice);

    return c.json({
      success: true,
      views: updatedNotice.views
    });

  } catch (error) {
    console.log('Increase notice views error:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 배너 목록 조회
app.get("/make-server-12a2c4b5/admin/banners", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    // Supabase Client 생성
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // 관리자 권한 확인
    const userData = await kv.get(`user:${user.id}`);
    if (!userData || !userData.isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    // 배너 목록 조회
    const banners = await kv.getByPrefix('banner:');
    
    return c.json({ 
      success: true, 
      banners: banners.sort((a: any, b: any) => a.order - b.order)
    });

  } catch (error) {
    console.log('배너 목록 조회 오류:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 배너 추가
app.post("/make-server-12a2c4b5/admin/banners", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    const body = await c.req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (!userData || !userData.isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const { title, imageUrl, linkUrl, isActive, order, position, startDate, endDate, clickCount } = body;

    if (!title || !imageUrl || !linkUrl) {
      return c.json({ error: '필수 필드가 누락되었습니다.' }, 400);
    }

    const bannerId = `banner-${Date.now()}`;
    const bannerData = {
      id: bannerId,
      title,
      imageUrl,
      linkUrl,
      isActive: isActive ?? true,
      order: order ?? 1,
      position: position ?? 'Main',
      startDate: startDate ?? '',
      endDate: endDate ?? '',
      clickCount: clickCount ?? 0,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`banner:${bannerId}`, bannerData);

    return c.json({ 
      success: true, 
      banner: bannerData,
      message: '배너가 추가되었습니다.'
    });

  } catch (error) {
    console.log('배너 추가 오류:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 배너 수정
app.put("/make-server-12a2c4b5/admin/banners/:id", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    const bannerId = c.req.param('id');
    const body = await c.req.json();

    console.log('배너 수정 요청:', { bannerId, body });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    console.log('인증 상태:', { userId: user?.id, authError: authError?.message });
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    console.log('사용자 데이터:', { isAdmin: userData?.isAdmin });
    
    if (!userData || !userData.isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const existingBanner = await kv.get(`banner:${bannerId}`);
    console.log('기존 배너:', existingBanner);
    
    if (!existingBanner) {
      return c.json({ error: '배너를 찾을 수 없습니다.' }, 404);
    }

    const { title, imageUrl, linkUrl, isActive, order, position, startDate, endDate, clickCount } = body;

    const updatedBanner = {
      ...existingBanner,
      title: title ?? existingBanner.title,
      imageUrl: imageUrl ?? existingBanner.imageUrl,
      linkUrl: linkUrl ?? existingBanner.linkUrl,
      isActive: isActive !== undefined ? isActive : existingBanner.isActive,
      order: order ?? existingBanner.order,
      position: position ?? existingBanner.position,
      startDate: startDate ?? existingBanner.startDate,
      endDate: endDate ?? existingBanner.endDate,
      clickCount: clickCount !== undefined ? clickCount : existingBanner.clickCount,
    };

    console.log('업데이트할 배너:', updatedBanner);
    await kv.set(`banner:${bannerId}`, updatedBanner);

    return c.json({ 
      success: true, 
      banner: updatedBanner,
      message: '배너가 수정되었습니다.'
    });

  } catch (error) {
    console.log('배너 수정 오류:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 배너 삭제
app.delete("/make-server-12a2c4b5/admin/banners/:id", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    const bannerId = c.req.param('id');

    console.log('배너 삭제 요청:', { bannerId });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    console.log('인증 상태:', { userId: user?.id, authError: authError?.message });
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    console.log('사용자 데이터:', { isAdmin: userData?.isAdmin });
    
    if (!userData || !userData.isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    console.log('배너 삭제 중...');
    await kv.del(`banner:${bannerId}`);

    return c.json({ 
      success: true, 
      message: '배너가 삭제되었습니다.'
    });

  } catch (error) {
    console.log('배너 삭제 오류:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// 배너 이미지 업로드 (Supabase Storage)
app.post("/make-server-12a2c4b5/admin/banners/upload", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (!userData || !userData.isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    // 버킷 생성 (이미 존재하면 무시)
    const bucketName = 'make-12a2c4b5-banners';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: true,
      });
    }

    // 파일 데이터 파싱
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: '파일이 없습니다.' }, 400);
    }

    // 파일명 생성
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `banners/${fileName}`;

    // 파일 업로드
    const arrayBuffer = await file.arrayBuffer();
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.log('파일 업로드 오류:', error);
      return c.json({ error: '파일 업로드에 실패했습니다.' }, 500);
    }

    // 공개 URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return c.json({ 
      success: true, 
      imageUrl: publicUrl,
      message: '이미지가 업로드되었습니다.'
    });

  } catch (error) {
    console.log('이미지 업로드 오류:', error);
    return c.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, 500);
  }
});

// Initialize test account on startup
initializeTestAccount().catch(console.error);

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', message: 'Server is running' });
});

Deno.serve(app.fetch);