export const translations = {
  en: {
    game_name: "CMPM 121 Final Project - Group 33",
    current_plant: "Current Plant",
    score: "Score: {score}",
    day: "Day: {day}",
    finish_day: "Finish Day",
    game_over: "Game Over! Your final score is: {score}",
    save_game_prompt: "Enter save slot name:",
    save_game_success: "Game saved to slot {slot}",
    save_game_failure:
      "Failed to save game to slot {slot}. Insufficient storage space.",
    load_game_prompt: "Enter save slot name:\nAvailable slots:\n{slots}",
    no_save_slots: "No save slots available.",
    game_loaded_success: "Game loaded from slot {slot}",
    game_loaded_failure: "No save found in slot {slot}",
    auto_save_continue: "Do you want to continue where you left off?",
    auto_save_loaded: "Game loaded from auto-save.",
    undo_checkpoint: "Undo Checkpoint",
    redo_checkpoint: "Redo Checkpoint",
    reset_to_initial: "Reset to initial state. No more days to undo.",
    no_days_to_redo: "No more days to redo.",
    controls: "Instructions",
    description:
      `Click the cells current or adjacent to the farmer to sow or reap plants. Click the Finish Day button to end your turn, advance the day, and autosave a checkpoint. You can use the Undo and Redo Checkpoint buttons if you want to replay a day/checkpoint. You can also manually create and load saves mid-day, creating more checkpoints for extra granularity.\n\nPlants require water and sunlight to grow. Different plants have different requirements (see below). Don't overcrowd plants or they will die (Black squares, reap to clear). See how high of a score you can get in {end_day} days!`,
    left_click: "Left Click",
    controls_left_click: "Sow a nearby plant",
    right_click: "Right Click",
    controls_right_click: "Reap a nearby plant",
    arrowsWasd: "Arrow or WASD keys",
    controls_movement: "Move player",
    cycle_plant: "1/2 or -/= keys",
    controls_switch: "Switch plant type",
  },
  zh: {
    game_name: "CMPM 121 最终项目 - 第33组",
    current_plant: "当前植物",
    score: "得分: {score}",
    day: "天: {day}",
    finish_day: "完成一天",
    game_over: "游戏结束！你的最终得分是：{score}",
    save_game_prompt: "请输入存档名称：",
    save_game_success: "游戏已保存到槽位 {slot}",
    save_game_failure: "无法将游戏保存到槽位 {slot}。存储空间不足。",
    load_game_prompt: "请输入存档名称：\n可用存档槽\n{slots}",
    no_save_slots: "没有可用的存档槽。",
    game_loaded_success: "游戏已从槽位 {slot} 加载",
    game_loaded_failure: "槽位 {slot} 中没有找到存档",
    auto_save_continue: "你想继续上次的游戏进度吗？",
    auto_save_loaded: "游戏已从自动保存加载。",
    undo_checkpoint: "撤销检查点",
    redo_checkpoint: "重做检查点",
    reset_to_initial: "已重置到初始状态。没有更多的天数可以撤销。",
    no_days_to_redo: "没有更多的天数可以重做。",
    controls: "操作说明",
    description:
      `点击农民当前或相邻的格子来播种或收割植物。点击“完成一天”按钮结束你的回合，推进一天，并自动保存一个检查点。你可以使用撤销和重做检查点按钮重玩一天或检查点。你也可以在一天中手动创建和加载存档，创建更多的检查点以获得额外的灵活性。\n\n植物需要水和阳光才能生长。不同的植物有不同的需求（见下文）。不要让植物过于密集，否则它们会死亡（黑色格子，收割以清理）。看看你能在 {end_day} 天内得到多高的分数！`,
    left_click: "左键单击",
    controls_left_click: "播种附近的植物",
    right_click: "右键单击",
    controls_right_click: "收割附近的植物",
    arrowsWasd: "箭头键或 WASD 键",
    controls_movement: "移动玩家",
    cycle_plant: "1/2 或 -/= 键",
    controls_switch: "切换植物类型",
  },
  ar: {
    game_name: "CMPM 121 المشروع النهائي - المجموعة 33",
    current_plant: "النبات الحالي",
    score: "النتيجة: {score}",
    day: "اليوم: {day}",
    finish_day: "إنهاء اليوم",
    game_over: "انتهت اللعبة! نتيجتك النهائية هي: {score}",
    save_game_prompt: "أدخل اسم فتحة الحفظ:",
    save_game_success: "تم حفظ اللعبة في الفتحة {slot}",
    save_game_failure: "فشل في حفظ اللعبة في الفتحة {slot}. المساحة غير كافية.",
    load_game_prompt: "أدخل اسم فتحة الحفظ:\nالفتحات المتاحة:\n{slots}",
    no_save_slots: "لا توجد فتحات حفظ متاحة.",
    game_loaded_success: "تم تحميل اللعبة من الفتحة {slot}",
    game_loaded_failure: "لم يتم العثور على حفظ في الفتحة {slot}",
    auto_save_continue: "هل تريد المتابعة من حيث توقفت؟",
    auto_save_loaded: "تم تحميل اللعبة من الحفظ التلقائي.",
    undo_checkpoint: "التراجع عن نقطة التحقق",
    redo_checkpoint: "إعادة نقطة التحقق",
    reset_to_initial:
      "تمت إعادة التعيين إلى الحالة الأولية. لا توجد أيام أخرى للتراجع عنها.",
    no_days_to_redo: "لا توجد أيام أخرى لإعادة تنفيذها.",
    controls: "الإرشادات",
    description:
      `انقر فوق الخلايا الحالية أو المجاورة للمزارع لزرع أو حصاد النباتات. انقر فوق زر "إنهاء اليوم" لإنهاء دورك، التقدم في اليوم، وحفظ نقطة تحقق تلقائيًا. يمكنك استخدام أزرار التراجع وإعادة التحقق إذا كنت تريد إعادة لعب يوم/نقطة تحقق. يمكنك أيضًا إنشاء وتحميل الحفظ يدويًا أثناء اليوم، مما يتيح نقاط تحقق إضافية لمرونة أكبر.\n\nتحتاج النباتات إلى الماء وأشعة الشمس لتنمو. لكل نبات متطلبات مختلفة (انظر أدناه). لا تزدحم النباتات وإلا ستموت (مربعات سوداء، احصد لتنظيفها). شاهد كم يمكنك تحقيقه من النقاط في {end_day} يومًا!`,
    left_click: "انقر بزر الماوس الأيسر",
    controls_left_click: "زرع النبات القريب",
    right_click: "انقر بزر الماوس الأيمن",
    controls_right_click: "حصاد النبات القريب",
    arrowsWasd: "مفاتيح الأسهم أو WASD",
    controls_movement: "تحريك اللاعب",
    cycle_plant: "1/2 أو -/= مفاتيح",
    controls_switch: "تبديل نوع النبات",
  },
};

export type Language = keyof typeof translations;
export type TranslationList = Record<Language, string[]>;

let currentLanguage: Language = "en";

export const setLanguage = (language: Language) => {
  currentLanguage = language;
};

export const t = (
  key: keyof typeof translations.en,
  params: Record<string, string | number> = {},
): string => {
  let text = translations[currentLanguage][key];
  Object.keys(params).forEach((param) => {
    text = text.replace(`{${param}}`, String(params[param]));
  });
  return text;
};

export const tl = (
  translationList: TranslationList,
  key: number,
  params: Record<string, string | number> = {},
): string => {
  let text = translationList[currentLanguage][key];
  Object.keys(params).forEach((param) => {
    text = text.replace(`{${param}}`, String(params[param]));
  });
  return text;
};
