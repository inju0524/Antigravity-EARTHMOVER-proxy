/**
 * Single Page Application HTML for the EARTHMOVER Web Dashboard.
 * Includes Traffic Logs, Request/Response payload viewer, Account health monitor, and Single-step tester.
 */
export function getDashboardHtml(): string {
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>EARTHMOVER Proxy · 控制台与流量日志</title>
	<!-- Tailwind CSS CDN -->
	<script src="https://cdn.tailwindcss.com"></script>
	<!-- Vue 3 CDN -->
	<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
	<style>
		[v-cloak] { display: none; }
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
		pre code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
		/* Custom scrollbars */
		::-webkit-scrollbar { width: 6px; height: 6px; }
		::-webkit-scrollbar-track { background: #f1f5f9; }
		::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
		::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
	</style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen">
	<div id="app" v-cloak class="flex flex-col min-h-screen">
		<!-- Top Navbar -->
		<header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex items-center justify-between h-16 gap-4">
					<!-- Brand & Recording status -->
					<div class="flex items-center gap-3">
						<div class="flex items-center gap-2">
							<span class="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">EARTHMOVER</span>
							<span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">v1.1.0</span>
						</div>

						<!-- Recording toggle badge -->
						<button @click="toggleRecording" class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition"
							:class="recording ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'">
							<span class="inline-block w-2 h-2 rounded-full" :class="recording ? 'bg-red-500 animate-pulse' : 'bg-slate-400'"></span>
							{{ recording ? '正在录制' : '已暂停' }}
						</button>
					</div>

					<!-- Search input (Only in logs tab) -->
					<div v-if="currentTab === 'logs'" class="flex-1 max-w-xl mx-2">
						<div class="relative">
							<input v-model="searchQuery" @input="debounceFetchLogs" type="text"
								placeholder="搜索模型 (gemini, claude)、路径 (chat, images) 或状态码..."
								class="w-full bg-slate-100 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg pl-9 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition" />
							<svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
							</svg>
							<button v-if="searchQuery" @click="searchQuery = ''; fetchLogs()" class="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
								<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
							</button>
						</div>
					</div>

					<!-- Right toolbar actions -->
					<div class="flex items-center gap-3">
						<!-- Account selector -->
						<select v-if="currentTab === 'logs'" v-model="selectedAccount" @change="fetchLogs"
							class="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none">
							<option value="all">👤 全部账号</option>
							<option v-for="acc in accountsList" :key="acc" :value="acc">{{ acc }}</option>
						</select>

						<!-- Stats counters -->
						<div v-if="currentTab === 'logs'" class="hidden md:flex items-center gap-2 text-xs font-medium">
							<span class="text-slate-600"><strong class="text-indigo-600">{{ totalCount }}</strong> 总计</span>
							<span class="text-slate-300">|</span>
							<span class="text-emerald-600"><strong class="text-emerald-700">{{ normalCount }}</strong> 正常</span>
							<span class="text-slate-300">|</span>
							<span class="text-rose-600"><strong class="text-rose-700">{{ errorCount }}</strong> 错误</span>
						</div>

						<!-- Action buttons -->
						<button @click="refreshCurrentTab" title="刷新数据" class="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition">
							<svg class="w-4 h-4" :class="loading ? 'animate-spin' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
						</button>
						<button v-if="currentTab === 'logs'" @click="clearLogs" title="清空全部日志" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
						</button>
					</div>
				</div>

				<!-- Navigation Tab Strip -->
				<div class="flex items-center gap-6 border-t border-slate-100 -mb-px text-sm font-medium">
					<button @click="currentTab = 'logs'" class="py-2.5 border-b-2 transition flex items-center gap-1.5"
						:class="currentTab === 'logs' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700'">
						<span>📡</span> 流量日志
						<span class="text-xs px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">{{ totalCount }}</span>
					</button>
					<button @click="currentTab = 'accounts'; fetchAccounts()" class="py-2.5 border-b-2 transition flex items-center gap-1.5"
						:class="currentTab === 'accounts' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700'">
						<span>👥</span> 账号监控
					</button>
					<button @click="currentTab = 'playground'" class="py-2.5 border-b-2 transition flex items-center gap-1.5"
						:class="currentTab === 'playground' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700'">
						<span>🧪</span> 单步测试
					</button>
					<a href="/debug/raw-models" target="_blank" class="py-2.5 border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition flex items-center gap-1">
						<span>📋</span> 上游原生模型 ↗
					</a>
				</div>
			</div>
		</header>

		<!-- Main Content Area -->
		<main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

			<!-- ================= TAB 1: 流量日志 (Traffic Logs) ================= -->
			<div v-if="currentTab === 'logs'" class="space-y-4">
				<!-- Quick filter bar (Matches screenshot chips) -->
				<div class="flex items-center justify-between flex-wrap gap-2 text-xs">
					<div class="flex items-center flex-wrap gap-1.5">
						<span class="text-slate-400 font-medium mr-1">快速过滤:</span>
						<button v-for="tag in filterTags" :key="tag.id" @click="setTagFilter(tag.id)"
							class="px-2.5 py-1 rounded-md font-medium transition"
							:class="activeTag === tag.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'">
							{{ tag.label }}
						</button>
					</div>
					<div class="text-slate-400 text-xs flex items-center gap-1">
						<span>内存滑动窗口缓存 (最新 500 条) · 点击任意行查看报文</span>
					</div>
				</div>

				<!-- Traffic Table -->
				<div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
					<div class="overflow-x-auto">
						<table class="w-full text-left border-collapse text-xs">
							<thead>
								<tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold select-none">
									<th class="py-3 px-3 w-16">状态</th>
									<th class="py-3 px-3 w-14">方法</th>
									<th class="py-3 px-4 min-w-[160px]">模型</th>
									<th class="py-3 px-3 w-20">协议</th>
									<th class="py-3 px-3 min-w-[130px]">账号</th>
									<th class="py-3 px-4 min-w-[180px]">路径</th>
									<th class="py-3 px-3 min-w-[110px]">Token 消耗</th>
									<th class="py-3 px-3 w-20">耗时</th>
									<th class="py-3 px-3 w-20">时间</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								<tr v-if="logs.length === 0" class="text-center py-12">
									<td colspan="9" class="py-12 text-slate-400">
										<div class="flex flex-col items-center justify-center gap-2">
											<svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
											<span>暂无捕获到的流量记录，发起请求或在「单步测试」发送即可查看</span>
										</div>
									</td>
								</tr>
								<tr v-for="item in logs" :key="item.id" @click="selectLog(item)"
									class="hover:bg-indigo-50/40 cursor-pointer transition select-none group">
									<!-- Status Badge -->
									<td class="py-2.5 px-3 whitespace-nowrap">
										<span class="inline-flex items-center justify-center px-2 py-0.5 rounded font-bold text-xs"
											:class="{
												'bg-emerald-500 text-white': item.status >= 200 && item.status < 300,
												'bg-rose-500 text-white': item.status >= 400 && item.status < 500,
												'bg-red-700 text-white': item.status >= 500,
												'bg-amber-500 text-white': item.status === 429,
												'bg-slate-400 text-white': item.status < 200
											}">
											{{ item.status }}
										</span>
									</td>

									<!-- Method -->
									<td class="py-2.5 px-3 font-bold text-slate-700 whitespace-nowrap">
										{{ item.method }}
									</td>

									<!-- Model -->
									<td class="py-2.5 px-4 font-semibold text-sky-700 hover:text-sky-900 truncate max-w-[200px]" :title="item.model">
										{{ item.model }}
									</td>

									<!-- Protocol Badge -->
									<td class="py-2.5 px-3 whitespace-nowrap">
										<span class="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium"
											:class="{
												'bg-emerald-100 text-emerald-800 border border-emerald-200': item.protocol === 'OpenAI',
												'bg-slate-800 text-white': item.protocol === 'warmup',
												'bg-slate-200 text-slate-800': item.protocol === 'responses',
												'bg-purple-100 text-purple-800 border border-purple-200': item.protocol === 'sdapi',
												'bg-blue-100 text-blue-800 border border-blue-200': item.protocol === 'debug',
												'bg-slate-100 text-slate-600': item.protocol === 'other'
											}">
											{{ item.protocol }}
										</span>
									</td>

									<!-- Account -->
									<td class="py-2.5 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
										{{ item.account }}
									</td>

									<!-- Path -->
									<td class="py-2.5 px-4 text-slate-600 font-mono text-[11px] truncate max-w-[220px]" :title="item.path">
										{{ item.path }}
									</td>

									<!-- Tokens -->
									<td class="py-2.5 px-3 text-slate-600 text-[11px] whitespace-nowrap">
										<div>输入: <strong class="text-slate-800">{{ formatTokens(item.tokens.input) }}</strong></div>
										<div>输出: <strong class="text-slate-800">{{ formatTokens(item.tokens.output) }}</strong></div>
									</td>

									<!-- Duration -->
									<td class="py-2.5 px-3 text-slate-600 whitespace-nowrap font-mono text-[11px]">
										{{ item.durationMs }}ms
									</td>

									<!-- Time -->
									<td class="py-2.5 px-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
										{{ item.timeStr }}
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<!-- Pagination / Summary footer -->
					<div class="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
						<div>显示第 1 到 {{ logs.length }} 条，共 {{ totalCount }} 条</div>
						<div class="flex items-center gap-2">
							<button @click="fetchLogs" class="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100">刷新列表</button>
						</div>
					</div>
				</div>
			</div>

			<!-- ================= TAB 2: 多账号监控 (Accounts) ================= -->
			<div v-if="currentTab === 'accounts'" class="space-y-6">
				<div class="flex items-center justify-between">
					<div>
						<h2 class="text-base font-bold text-slate-800">KV 账号池与凭据健康状态</h2>
						<p class="text-xs text-slate-500">自动检测 Google Code Assist 账号配额健康状况，当遇到 429 时将自动避让并热备轮询</p>
					</div>
					<button @click="fetchAccounts" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition">
						🔄 重新检测配额
					</button>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<div v-for="acc in accountsPool" :key="acc.id" class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<div class="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
									👤
								</div>
								<div>
									<h3 class="font-bold text-sm text-slate-800">{{ acc.email }}</h3>
									<span class="text-[11px] text-slate-400 font-mono">ID: {{ acc.id }}</span>
								</div>
							</div>
							<span class="text-xs px-2 py-0.5 rounded font-semibold"
								:class="acc.is_invalid ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'">
								{{ acc.is_invalid ? '凭据失效' : '正常可用' }}
							</span>
						</div>

						<div class="border-t border-slate-100 pt-3 space-y-2 text-xs">
							<div class="flex items-center justify-between">
								<span class="text-slate-500">Gemini 配额状态:</span>
								<span class="font-semibold px-2 py-0.5 rounded"
									:class="acc.gemini_status === 'healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'">
									{{ acc.gemini_status === 'healthy' ? '🟢 配额充裕' : '🛑 已耗尽冷却中' }}
								</span>
							</div>

							<div class="flex items-center justify-between">
								<span class="text-slate-500">Claude/Partner 配额:</span>
								<span class="font-semibold px-2 py-0.5 rounded"
									:class="acc.partner_status === 'healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'">
									{{ acc.partner_status === 'healthy' ? '🟢 配额充裕' : '🛑 已耗尽冷却中' }}
								</span>
							</div>

							<div class="flex items-center justify-between">
								<span class="text-slate-500">调度优先级:</span>
								<span class="font-mono font-medium text-slate-700">{{ acc.priority }} (数值越小越优先)</span>
							</div>

							<div class="flex items-center justify-between">
								<span class="text-slate-500">Token 有效期剩余:</span>
								<span class="font-mono font-medium text-slate-700">{{ acc.token_expires_in }}s</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- ================= TAB 3: 单步测试 (Playground) ================= -->
			<div v-if="currentTab === 'playground'" class="max-w-4xl mx-auto space-y-6">
				<div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
					<div>
						<h2 class="text-base font-bold text-slate-800">在线单步测试 (Single-Step Playground)</h2>
						<p class="text-xs text-slate-500">直接向线上 Worker 发起测试请求，实时验证新模型、思考级别与报文捕获</p>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-xs font-semibold text-slate-700 mb-1">选择模型</label>
							<select v-model="testForm.model" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100">
								<optgroup label="Gemini 3.8 全新模型家族">
									<option value="gemini-3.8-flash-high">gemini-3.8-flash-high (深度思考)</option>
									<option value="gemini-3.8-flash-medium">gemini-3.8-flash-medium (中度思考)</option>
									<option value="gemini-3.8-flash-low">gemini-3.8-flash-low (轻度思考)</option>
									<option value="gemini-3.8-flash-tiered">gemini-3.8-flash-tiered (自动分层)</option>
								</optgroup>
								<optgroup label="Gemini 3.6 / 3.7 模型家族">
									<option value="gemini-3.6-flash-high">gemini-3.6-flash-high</option>
									<option value="gemini-3.6-flash-low">gemini-3.6-flash-low</option>
									<option value="gemini-3.7-flash-high">gemini-3.7-flash-high</option>
								</optgroup>
								<optgroup label="Claude & Pro 系列">
									<option value="claude-sonnet-4-6">claude-sonnet-4-6</option>
									<option value="claude-opus-4-6-thinking">claude-opus-4-6-thinking</option>
									<option value="gemini-3.1-pro-high">gemini-3.1-pro-high</option>
								</optgroup>
							</select>
						</div>

						<div>
							<label class="block text-xs font-semibold text-slate-700 mb-1">思考强度 (Reasoning Effort)</label>
							<select v-model="testForm.reasoning_effort" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100">
								<option value="high">high (深层链式思考)</option>
								<option value="medium">medium (中度思考)</option>
								<option value="low">low (浅层思考)</option>
								<option value="none">none (关闭思考)</option>
							</select>
						</div>
					</div>

					<div>
						<label class="block text-xs font-semibold text-slate-700 mb-1">测试提示词 (Prompt)</label>
						<textarea v-model="testForm.prompt" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100" placeholder="输入测试问题..."></textarea>
					</div>

					<div class="flex items-center justify-between pt-2">
						<span class="text-xs text-slate-400">请求完成后会自动记入流量日志中</span>
						<button @click="runSingleTest" :disabled="testing"
							class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-semibold shadow-sm transition flex items-center gap-2">
							<svg v-if="testing" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
							{{ testing ? '正在调用上游...' : '🚀 立即发起测试' }}
						</button>
					</div>
				</div>

				<!-- Test Results Box -->
				<div v-if="testResult" class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
					<div class="flex items-center justify-between border-b border-slate-100 pb-3">
						<div class="flex items-center gap-2">
							<span class="px-2 py-0.5 rounded text-xs font-bold" :class="testResult.ok ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'">
								{{ testResult.ok ? '测试成功 200' : '测试失败' }}
							</span>
							<span class="text-xs text-slate-500 font-mono">耗时: {{ testResult.durationMs }}ms</span>
							<span class="text-xs text-slate-400">· 调度账号: {{ testResult.account }}</span>
						</div>
					</div>

					<!-- Reasoning thought box -->
					<div v-if="testResult.completion?.choices?.[0]?.message?.reasoning_content" class="bg-amber-50/60 border border-amber-200 rounded-lg p-4">
						<div class="text-xs font-bold text-amber-800 mb-1.5 flex items-center gap-1">
							<span>🧠 模型思考链 (Reasoning):</span>
						</div>
						<div class="text-xs text-amber-900 whitespace-pre-wrap font-mono leading-relaxed max-h-60 overflow-y-auto">
							{{ testResult.completion.choices[0].message.reasoning_content }}
						</div>
					</div>

					<!-- Main content -->
					<div>
						<div class="text-xs font-bold text-slate-700 mb-1.5">💬 回复正文:</div>
						<div class="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
							{{ testResult.completion?.choices?.[0]?.message?.content || testResult.error }}
						</div>
					</div>
				</div>
			</div>
		</main>

		<!-- ================= SLIDE-OVER DRAWER: 报文详细查看器 (重点功能) ================= -->
		<div v-if="selectedItem" class="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-opacity" @click.self="selectedItem = null">
			<div class="absolute inset-y-0 right-0 max-w-full flex pl-10">
				<div class="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200">
					<!-- Drawer Header -->
					<div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
						<div class="flex items-center gap-3">
							<span class="px-2 py-0.5 rounded font-bold text-xs"
								:class="{
									'bg-emerald-500 text-white': selectedItem.status >= 200 && selectedItem.status < 300,
									'bg-rose-500 text-white': selectedItem.status >= 400,
									'bg-amber-500 text-white': selectedItem.status === 429
								}">
								{{ selectedItem.status }}
							</span>
							<span class="font-bold text-slate-800 text-sm">{{ selectedItem.method }}</span>
							<span class="font-mono text-xs text-slate-500 truncate max-w-xs">{{ selectedItem.path }}</span>
						</div>
						<button @click="selectedItem = null" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
						</button>
					</div>

					<!-- Drawer Sub-info Bar -->
					<div class="px-6 py-2.5 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
						<div class="flex items-center gap-4">
							<span>模型: <strong class="text-indigo-600">{{ selectedItem.model }}</strong></span>
							<span>账号: <strong class="text-slate-700">{{ selectedItem.account }}</strong></span>
							<span>耗时: <strong class="text-slate-700">{{ selectedItem.durationMs }}ms</strong></span>
						</div>
						<div>
							<span>时间: {{ selectedItem.timeStr }}</span>
						</div>
					</div>

					<!-- Drawer Tabs (响应报文 / 请求报文) -->
					<div class="flex border-b border-slate-200 px-6 bg-white text-xs font-semibold">
						<button @click="drawerTab = 'response'" class="py-3 border-b-2 mr-6 transition flex items-center gap-1.5"
							:class="drawerTab === 'response' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'">
							<span>📥</span> 响应报文 (Response)
						</button>
						<button @click="drawerTab = 'request'" class="py-3 border-b-2 mr-6 transition flex items-center gap-1.5"
							:class="drawerTab === 'request' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'">
							<span>📤</span> 请求报文 (Request)
						</button>
					</div>

					<!-- Drawer Body Content -->
					<div class="flex-1 overflow-y-auto p-6 space-y-4">

						<!-- === 响应报文 (Response) === -->
						<div v-if="drawerTab === 'response'" class="space-y-4">
							<!-- Error alert box if status >= 400 -->
							<div v-if="selectedItem.status >= 400" class="bg-rose-50 border border-rose-200 rounded-lg p-4">
								<div class="text-xs font-bold text-rose-800 mb-1 flex items-center gap-1.5">
									<span>⚠️ 接口错误详情 (Status {{ selectedItem.status }}):</span>
								</div>
								<pre class="text-xs text-rose-700 font-mono whitespace-pre-wrap">{{ JSON.stringify(selectedItem.response.body, null, 2) }}</pre>
							</div>

							<!-- Stream reasoning thought box if present -->
							<div v-if="selectedItem.response.body?.reasoning_text" class="bg-amber-50/70 border border-amber-200 rounded-lg p-4">
								<div class="text-xs font-bold text-amber-800 mb-1.5 flex items-center gap-1">
									<span>🧠 流式思考推理过程 (Reasoning):</span>
								</div>
								<div class="text-xs text-amber-900 whitespace-pre-wrap font-mono leading-relaxed max-h-60 overflow-y-auto">
									{{ selectedItem.response.body.reasoning_text }}
								</div>
							</div>

							<!-- Response Body -->
							<div>
								<div class="flex items-center justify-between mb-1.5">
									<label class="text-xs font-bold text-slate-700">响应正文 (Payload)</label>
									<button @click="copyText(JSON.stringify(selectedItem.response.body, null, 2))" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
										📋 复制响应 JSON
									</button>
								</div>
								<div class="bg-slate-900 rounded-lg p-4 overflow-x-auto text-xs font-mono text-emerald-400 max-h-[420px] overflow-y-auto shadow-inner">
									<pre><code>{{ JSON.stringify(selectedItem.response.body, null, 2) }}</code></pre>
								</div>
							</div>

							<!-- Response Headers -->
							<div>
								<label class="text-xs font-bold text-slate-700 mb-1.5 block">响应头 (Headers)</label>
								<div class="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-700 max-h-36 overflow-y-auto">
									<pre><code>{{ JSON.stringify(selectedItem.response.headers, null, 2) }}</code></pre>
								</div>
							</div>
						</div>

						<!-- === 请求报文 (Request) === -->
						<div v-if="drawerTab === 'request'" class="space-y-4">
							<!-- Request Body -->
							<div>
								<div class="flex items-center justify-between mb-1.5">
									<label class="text-xs font-bold text-slate-700">请求体 (Request Body)</label>
									<button @click="copyText(JSON.stringify(selectedItem.request.body, null, 2))" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
										📋 复制请求 JSON
									</button>
								</div>
								<div class="bg-slate-900 rounded-lg p-4 overflow-x-auto text-xs font-mono text-sky-400 max-h-[420px] overflow-y-auto shadow-inner">
									<pre><code>{{ JSON.stringify(selectedItem.request.body, null, 2) }}</code></pre>
								</div>
							</div>

							<!-- Request Headers -->
							<div>
								<label class="text-xs font-bold text-slate-700 mb-1.5 block">请求头 (Headers)</label>
								<div class="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-700 max-h-36 overflow-y-auto">
									<pre><code>{{ JSON.stringify(selectedItem.request.headers, null, 2) }}</code></pre>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<script>
		const { createApp, ref, onMounted } = Vue;

		createApp({
			setup() {
				const currentTab = ref('logs');
				const logs = ref([]);
				const totalCount = ref(0);
				const normalCount = ref(0);
				const errorCount = ref(0);
				const recording = ref(true);
				const loading = ref(false);

				const searchQuery = ref('');
				const selectedAccount = ref('all');
				const accountsList = ref([]);
				const activeTag = ref('all');

				const selectedItem = ref(null);
				const drawerTab = ref('response');

				// Accounts tab
				const accountsPool = ref([]);

				// Playground tab
				const testing = ref(false);
				const testResult = ref(null);
				const testForm = ref({
					model: 'gemini-3.8-flash-high',
					reasoning_effort: 'high',
					prompt: '你好！请用两句话介绍一下你的推理机制。'
				});

				const filterTags = [
					{ id: 'all', label: '全部' },
					{ id: 'claude', label: 'claude' },
					{ id: 'flash', label: 'flash' },
					{ id: 'pro', label: 'pro' },
					{ id: 'agent', label: 'agent' },
					{ id: 'error', label: '仅错误' },
					{ id: 'chat', label: '聊天' },
					{ id: 'gemini', label: 'Gemini' },
					{ id: 'draw', label: '绘图' },
					{ id: 'health', label: '● 捕获健康检查' }
				];

				async function fetchLogs() {
					loading.value = true;
					try {
						let statusParam = '';
						let q = searchQuery.value;

						if (activeTag.value === 'error') statusParam = 'error';
						else if (activeTag.value === 'chat') q = (q ? q + ' ' : '') + 'chat';
						else if (activeTag.value === 'draw') q = (q ? q + ' ' : '') + 'sdapi';
						else if (activeTag.value === 'health') q = (q ? q + ' ' : '') + 'health';
						else if (activeTag.value !== 'all') q = (q ? q + ' ' : '') + activeTag.value;

						const url = \`/dashboard/api/logs?limit=100&q=\${encodeURIComponent(q)}&account=\${selectedAccount.value === 'all' ? '' : encodeURIComponent(selectedAccount.value)}&status=\${statusParam}\`;
						const res = await fetch(url);
						if (res.ok) {
							const data = await res.json();
							logs.value = data.items || [];
							totalCount.value = data.total || 0;
							normalCount.value = data.normalCount || 0;
							errorCount.value = data.errorCount || 0;
							recording.value = data.recording;
							if (data.accounts && data.accounts.length > 0) {
								accountsList.value = data.accounts;
							}
						}
					} catch (e) {
						console.error('Fetch logs error:', e);
					} finally {
						loading.value = false;
					}
				}

				let debounceTimer = null;
				function debounceFetchLogs() {
					clearTimeout(debounceTimer);
					debounceTimer = setTimeout(() => {
						fetchLogs();
					}, 300);
				}

				function setTagFilter(tagId) {
					activeTag.value = tagId;
					fetchLogs();
				}

				async function toggleRecording() {
					const newState = !recording.value;
					try {
						const res = await fetch('/dashboard/api/recording', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ recording: newState })
						});
						if (res.ok) {
							const d = await res.json();
							recording.value = d.recording;
						}
					} catch (e) {
						console.error(e);
					}
				}

				async function clearLogs() {
					if (!confirm('确定清空当前内存中的所有流量记录吗？')) return;
					await fetch('/dashboard/api/logs', { method: 'DELETE' });
					fetchLogs();
				}

				function selectLog(item) {
					selectedItem.value = item;
					drawerTab.value = 'response';
				}

				async function fetchAccounts() {
					try {
						const res = await fetch('/dashboard/api/accounts');
						if (res.ok) {
							const d = await res.json();
							accountsPool.value = d.accounts || [];
						}
					} catch (e) {
						console.error(e);
					}
				}

				async function runSingleTest() {
					testing.value = true;
					testResult.value = null;
					try {
						const res = await fetch('/dashboard/api/test-run', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(testForm.value)
						});
						const d = await res.json();
						testResult.value = d;
						// Refresh logs in background
						fetchLogs();
					} catch (e) {
						testResult.value = { ok: false, error: String(e) };
					} finally {
						testing.value = false;
					}
				}

				function refreshCurrentTab() {
					if (currentTab.value === 'logs') fetchLogs();
					else if (currentTab.value === 'accounts') fetchAccounts();
				}

				function formatTokens(n) {
					if (!n) return '0';
					if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
					return String(n);
				}

				function copyText(txt) {
					navigator.clipboard.writeText(txt);
					alert('已复制到剪贴板！');
				}

				onMounted(() => {
					fetchLogs();
					// Auto refresh logs every 3 seconds if recording
					setInterval(() => {
						if (recording.value && currentTab.value === 'logs') {
							fetchLogs();
						}
					}, 3000);
				});

				return {
					currentTab,
					logs,
					totalCount,
					normalCount,
					errorCount,
					recording,
					loading,
					searchQuery,
					selectedAccount,
					accountsList,
					activeTag,
					filterTags,
					selectedItem,
					drawerTab,
					accountsPool,
					testing,
					testResult,
					testForm,
					fetchLogs,
					debounceFetchLogs,
					setTagFilter,
					toggleRecording,
					clearLogs,
					selectLog,
					fetchAccounts,
					runSingleTest,
					refreshCurrentTab,
					formatTokens,
					copyText
				};
			}
		}).mount('#app');
	</script>
</body>
</html>`;
}
