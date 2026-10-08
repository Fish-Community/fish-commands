export const runtimeToYopta = Object.freeze({
	Vars: "Срал",
	Log: "Текст",
	netServer: "сервак",
	admins: "пидоры",
	playerInfo: "доксДеанон",
	ban: "пошелНахуй",
	banPlayerID: "пошелНахуйПлеерАйДи",
	banPlayerIP: "пошелНахуйПлеерАйПи",
});

export const yoptaToRuntime = Object.freeze(
	Object.fromEntries(Object.entries(runtimeToYopta).map(([runtimeName, yoptaName]) => [yoptaName, runtimeName]))
);
