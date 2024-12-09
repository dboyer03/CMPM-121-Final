export const translations = {
    en: {
      game_name: "CMPM 121 Final Project - Group 33",
      current_plant: "Current Plant",
      score: "Score",
      day: "Day",
      finish_day: "Finish Day",
      game_over: "Game Over! Your final score is: {score}",
      save_game_prompt: "Enter save slot name:",
      save_game_success: "Game saved to slot {slot}",
      save_game_failure: "Failed to save game to slot {slot}. Insufficient storage space.",
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
      description: `Click the cells current or adjacent to the farmer to sow or reap plants. Click the Finish Day button to end your turn, advance the day, and autosave a checkpoint. You can use the Undo and Redo Checkpoint buttons if you want to replay a day/checkpoint. You can also manually create and load saves mid-day, creating more checkpoints for extra granularity.\n\nPlants require water and sunlight to grow. Different plants have different requirements (see below). Don't overcrowd plants or they will die (Black squares, reap to clear). See how high of a score you can get in {end_day} days!`,
      plant_instructions: {
        plant_details: "({index}) {name}:<br>To Grow: {water} water, {sunlight} sunlight, {crowding} maximum adjacent plants<br>Can sow at level {maxGrowth}",
      },
    },
    zh: {
        game_name: "CMPM 121 最终项目 - 第33组",
        current_plant: "当前植物",
        score: "得分",
        day: "天",
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
        description: `点击农民当前或相邻的格子来播种或收割植物。点击“完成一天”按钮结束你的回合，推进一天，并自动保存一个检查点。你可以使用撤销和重做检查点按钮重玩一天或检查点。你也可以在一天中手动创建和加载存档，创建更多的检查点以获得额外的灵活性。\n\n植物需要水和阳光才能生长。不同的植物有不同的需求（见下文）。不要让植物过于密集，否则它们会死亡（黑色格子，收割以清理）。看看你能在 {end_day} 天内得到多高的分数！`,
        plant_instructions: {
          plant_details: "({index}) {name}:<br>成长需求: {water} 水, {sunlight} 阳光, {crowding} 最大相邻植物数量<br>可以在 {maxGrowth} 级时播种",
        },
      },
    ar: {
      // Add Arabic translations here
    },
  };
  
  
  export type Language = keyof typeof translations;
  