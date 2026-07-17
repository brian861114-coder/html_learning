window.LEARNING_CATALOG = [
  {
    id: "calculus", slug: "calculus", icon: "∫", title: "微積分", subtitle: "Calculus",
    description: "從函數、極限到向量微積分與微分方程。",
    href: "subjects/calculus/index.html", accent: "#2563eb",
    stats: { chapters: 17, models: 10, exercises: 604, status: "可完整閱讀" },
    chapters: []
  },
  {
    id: "materials", slug: "material-science", icon: "◇", title: "材料科學與工程", subtitle: "Materials Science and Engineering",
    description: "從原子結構、晶體缺陷到擴散、相變與工程材料。",
    href: "subjects/material-science/index.html", accent: "#0f766e",
    stats: { chapters: 15, models: 0, exercises: 55, status: "可完整閱讀" },
    chapters: [
      [1, "材料科學與工程導論", "Introduction", "html/chapters/ch1_introduction_zh.html"],
      [2, "原子結構與鍵結", "Atomic Structure and Bonding", "html/chapters/ch2_atomic_structure_zh.html"],
      [3, "晶體固體的結構", "Crystalline Solids", "html/chapters/ch3_crystalline_solids_zh.html"],
      [4, "固體中的不完整性", "Imperfections in Solids", "html/chapters/ch4_imperfections_zh.html"],
      [5, "擴散", "Diffusion", "html/chapters/ch5_diffusion_zh.html"],
      [6, "金屬的機械性質", "Mechanical Properties", "html/chapters/ch6_mechanical_properties_zh.html"],
      [7, "位錯與強化機構", "Dislocations and Strengthening", "html/chapters/ch7_dislocations_zh.html"],
      [8, "破壞", "Failure", "html/chapters/ch8_failure_zh.html"],
      [9, "相圖", "Phase Diagrams", "html/chapters/ch9_phase_diagrams_zh.html"],
      [10, "相變", "Phase Transformations", "html/chapters/ch10_phase_transformations_zh.html"],
      [11, "金屬合金的應用與加工", "Metal Alloys", "html/chapters/ch11_metal_alloys_zh.html"],
      [12, "陶瓷的結構與性質", "Ceramic Structures", "html/chapters/ch12_ceramic_structures_zh.html"],
      [13, "陶瓷的應用與加工", "Ceramic Applications", "html/chapters/ch13_ceramic_applications_zh.html"],
      [14, "高分子結構", "Polymer Structures", "html/chapters/ch14_polymer_structures_zh.html"],
      [15, "高分子的應用與加工", "Polymer Applications", "html/chapters/ch15_polymer_applications_zh.html"]
    ]
  },
  {
    id: "quantum", slug: "quantum-mechanics", icon: "ψ", title: "量子力學", subtitle: "Quantum Mechanics",
    description: "從機率振幅、算符到氫原子、微擾與散射。",
    href: "subjects/quantum-mechanics/index.html", accent: "#7c3aed",
    stats: { chapters: 12, models: 0, exercises: 81, status: "可完整閱讀" },
    chapters: [
      [1, "機率與機率振幅", "Probability", "html/chapters/ch1_probability_zh.html"],
      [2, "算符、測量與時間演化", "Operators", "html/chapters/ch2_operators_zh.html"],
      [3, "諧振子與磁場", "Harmonic Oscillator", "html/chapters/ch3_harmonic_zh.html"],
      [4, "變換與對稱性", "Transformations", "html/chapters/ch4_transformations_zh.html"],
      [5, "階梯勢與穿隧", "Step Potentials", "html/chapters/ch5_step_potentials_zh.html"],
      [6, "複合系統", "Composite Systems", "html/chapters/ch6_composite_zh.html"],
      [7, "角動量", "Angular Momentum", "html/chapters/ch7_angular_momentum_zh.html"],
      [8, "氫原子", "Hydrogen", "html/chapters/ch8_hydrogen_zh.html"],
      [9, "微擾理論", "Perturbation Theory", "html/chapters/ch9_perturbation_zh.html"],
      [10, "氦原子", "Helium", "html/chapters/ch10_helium_zh.html"],
      [11, "絕熱近似", "Adiabatic Approximation", "html/chapters/ch11_adiabatic_zh.html"],
      [12, "散射", "Scattering", "html/chapters/ch12_scattering_zh.html"]
    ]
  },
  {
    id: "semiconductor", slug: "solid-state-physics", icon: "▣", title: "半導體物理與元件", subtitle: "Semiconductor Physics and Devices",
    description: "從晶體與能帶到 pn 接面、MOSFET、BJT 與光電元件。",
    href: "subjects/solid-state-physics/index.html", accent: "#0369a1",
    stats: { chapters: 15, models: 8, exercises: 405, status: "可完整閱讀" },
    chapters: []
  },
  {
    id: "thermodynamics", slug: "thermodynamics", icon: "Δ", title: "材料熱力學", subtitle: "Thermodynamics of Materials",
    description: "從熱力學定律、熵與自由能到相平衡、溶液與電化學。",
    href: "subjects/thermodynamics/index.html", accent: "#c2410c",
    stats: { chapters: 15, models: 0, exercises: 52, status: "可完整閱讀" },
    chapters: [
      [1, "熱力學導論與基本名詞", "Introduction and Definitions", "html/chapters/ch01_intro_terms_zh.html"],
      [2, "熱力學第一定律", "The First Law", "html/chapters/ch02_first_law_zh.html"],
      [3, "熱力學第二定律", "The Second Law", "html/chapters/ch03_second_law_zh.html"],
      [4, "熵的統計解釋", "Statistical Entropy", "html/chapters/ch04_statistical_entropy_zh.html"],
      [5, "熱力學基本關係式", "Fundamental Equations", "html/chapters/ch05_fundamental_eqs_zh.html"],
      [6, "熱容與第三定律", "Heat Capacity and Third Law", "html/chapters/ch06_heat_capacity_third_law_zh.html"],
      [7, "單元系相平衡", "One-Component Phase Equilibrium", "html/chapters/ch07_phase_equilibrium_one_comp_zh.html"],
      [8, "氣體的行為", "Behavior of Gases", "html/chapters/ch08_behavior_of_gases_zh.html"],
      [9, "溶液的行為", "Behavior of Solutions", "html/chapters/ch09_behavior_of_solutions_zh.html"],
      [10, "二元相圖", "Binary Phase Diagrams", "html/chapters/ch10_binary_phase_diagrams_zh.html"],
      [11, "氣相反應", "Reactions Involving Gases", "html/chapters/ch11_reactions_gases_zh.html"],
      [12, "Ellingham 圖", "Ellingham Diagrams", "html/chapters/ch12_ellingham_zh.html"],
      [13, "凝聚相溶液反應", "Condensed Solution Reactions", "html/chapters/ch13_condensed_solution_reactions_zh.html"],
      [14, "電化學", "Electrochemistry", "html/chapters/ch14_electrochemistry_zh.html"],
      [15, "相變", "Phase Transformations", "html/chapters/ch15_phase_transformations_zh.html"]
    ]
  }
];
