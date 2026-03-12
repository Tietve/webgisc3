const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const BASE = 'http://72.62.127.109:9000';
const API = `${BASE}/api/v1`;
const OUT = path.resolve(__dirname, '..');

async function apiLogin(email, password) {
  const res = await fetch(`${API}/auth/token/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  if (!res.ok) throw new Error(`Login failed ${res.status}`);
  const token = await res.json();
  const profileRes = await fetch(`${API}/auth/profile/`, { headers: { Authorization: `Bearer ${token.access}` } });
  return { token: token.access, profile: await profileRes.json() };
}
async function getJson(url, token) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`GET ${url} failed ${res.status}`);
  return res.json();
}
async function authedPage(browser, auth) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const consoleErrors = [];
  const page = await context.newPage();
  page.setDefaultTimeout(45000);
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
  });
  await page.addInitScript(({ token, profile }) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(profile));
  }, auth);
  return { context, page, consoleErrors };
}
async function gotoSoft(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const student = await apiLogin('student01@webgis.com', 'student123');
  const teacher = await apiLogin('teacher01@webgis.com', 'teacher123');
  const lessons = await getJson(`${API}/lessons/?grade_level=10&semester=1&textbook_series=canh-dieu`, student.token);
  const quizzes = await getJson(`${API}/quizzes/?grade_level=10&semester=1&textbook_series=canh-dieu`, student.token);
  const classrooms = await getJson(`${API}/classrooms/?grade_level=10&semester=1&textbook_series=canh-dieu`, student.token);
  const quizId = quizzes.results[0].id;
  const module05Lesson = lessons.results.find((item) => item.module_code === 'module-05' && item.lesson_type === 'practice');
  const classroomId = classrooms.results[0]?.id;
  const browser = await chromium.launch({ headless: true });
  const report = { base: BASE, checks: [], screenshots: [], console: {} };

  const studentSession = await authedPage(browser, student);
  await gotoSoft(studentSession.page, `${BASE}/grade-10`);
  await studentSession.page.screenshot({ path: path.join(OUT, 'student-grade10.png'), fullPage: true });
  const grade10Body = await studentSession.page.locator('body').textContent();
  report.checks.push({ name: 'student grade-10 page', pass: grade10Body.includes('Địa lí 10') && grade10Body.includes('Cánh Diều') && grade10Body.includes('module-06') });
  report.screenshots.push('student-grade10.png');
  report.console.studentGrade10 = studentSession.consoleErrors;

  await gotoSoft(studentSession.page, `${BASE}/lessons/${module05Lesson.id}`);
  await studentSession.page.screenshot({ path: path.join(OUT, 'student-lesson-module05.png'), fullPage: true });
  report.checks.push({ name: 'student module 05 lesson', pass: (await studentSession.page.locator('body').textContent()).includes('Thủy quyển') });
  report.screenshots.push('student-lesson-module05.png');

  await gotoSoft(studentSession.page, `${BASE}/map?grade=10&semester=1&textbook=canh-dieu&module=module-05&studentView=1`);
  await studentSession.page.screenshot({ path: path.join(OUT, 'student-map-module05.png'), fullPage: true });
  report.checks.push({ name: 'student module 05 map', pass: studentSession.page.url().includes('/map?') });
  report.screenshots.push('student-map-module05.png');

  await gotoSoft(studentSession.page, `${BASE}/quiz/${quizId}`);
  await studentSession.page.screenshot({ path: path.join(OUT, 'student-quiz-deeplink.png'), fullPage: true });
  report.checks.push({ name: 'student quiz deeplink', pass: studentSession.page.url().includes(`/quiz/${quizId}`) && !(studentSession.page.url().includes('/login')) });
  report.screenshots.push('student-quiz-deeplink.png');
  report.console.studentQuiz = studentSession.consoleErrors;

  const teacherSession = await authedPage(browser, teacher);
  await gotoSoft(teacherSession.page, `${BASE}/classrooms`);
  await teacherSession.page.screenshot({ path: path.join(OUT, 'teacher-classrooms.png'), fullPage: true });
  const teacherBody = await teacherSession.page.locator('body').textContent();
  report.checks.push({ name: 'teacher classroom list', pass: teacherBody.includes('Địa lí 10 - Cánh Diều - HK1') });
  report.screenshots.push('teacher-classrooms.png');
  report.console.teacherClassrooms = teacherSession.consoleErrors;

  if (classroomId) {
    await gotoSoft(teacherSession.page, `${BASE}/classrooms/${classroomId}?tab=classwork`);
    await teacherSession.page.screenshot({ path: path.join(OUT, 'teacher-classroom-detail.png'), fullPage: true });
    report.checks.push({ name: 'teacher classroom detail', pass: (await teacherSession.page.locator('body').textContent()).includes('HK1') });
    report.screenshots.push('teacher-classroom-detail.png');

    await gotoSoft(studentSession.page, `${BASE}/classrooms/${classroomId}?tab=classwork`);
    await studentSession.page.screenshot({ path: path.join(OUT, 'student-classroom-detail.png'), fullPage: true });
    report.checks.push({ name: 'student classroom detail', pass: (await studentSession.page.locator('body').textContent()).includes('HK1') });
    report.screenshots.push('student-classroom-detail.png');
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'smoke-report.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(report, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

