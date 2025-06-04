// src/utils/battleAnimations.js - Complete Animation System (FIXED EXPORTS)
import { createRoot } from 'react-dom/client';

// Animation constants for timing
export const ANIMATION_DURATIONS = {
  ATTACK: 800,           // Base attack animation duration
  ATTACK_CRITICAL: 1200, // Critical attack animation
  DEFEND: 600,           // Defend animation duration
  SPELL: 1200,           // Spell animation duration
  TOOL: 900,             // Tool animation duration
  DAMAGE_NUMBER: 1500,   // How long damage numbers show
  TURN_TRANSITION: 600,  // Turn change animation
  AI_THINKING: {
    NORMAL: 800,        // Normal AI thinking time
    COMPLEX: 1500       // Complex decision AI thinking time
  }
};

// Constants for animation classes
export const ANIMATION_CLASSES = {
  ATTACK: {
    PHYSICAL: 'battle-animation-physical-attack',
    MAGICAL: 'battle-animation-magical-attack',
    CRITICAL: 'battle-animation-critical'
  },
  DEFEND: 'battle-animation-defend',
  SPELL: {
    FIRE: 'battle-animation-spell-fire',
    ICE: 'battle-animation-spell-ice', 
    LIGHTNING: 'battle-animation-spell-lightning',
    DARK: 'battle-animation-spell-dark',
    HEAL: 'battle-animation-spell-heal',
    BUFF: 'battle-animation-spell-buff',
    DEFAULT: 'battle-animation-spell-default'
  },
  TOOL: {
    DAMAGE: 'battle-animation-tool-damage',
    HEALING: 'battle-animation-tool-healing',
    BUFF: 'battle-animation-tool-buff',
    SHIELD: 'battle-animation-tool-shield',
    DEFAULT: 'battle-animation-tool-default'
  },
  STATUS: {
    BUFF: 'battle-animation-status-buff',
    DEBUFF: 'battle-animation-status-debuff'
  },
  DAMAGE_TEXT: {
    PHYSICAL: 'battle-animation-damage-physical',
    MAGICAL: 'battle-animation-damage-magical',
    CRITICAL: 'battle-animation-damage-critical',
    HEAL: 'battle-animation-damage-heal'
  },
  AI: {
    THINKING: 'battle-animation-ai-thinking'
  }
};

/**
 * Creates and animates an attack effect between two card elements
 * @param {HTMLElement} attackerElement The attacker card element
 * @param {HTMLElement} targetElement The target card element
 * @param {string} attackType 'physical' or 'magical'
 * @param {boolean} isCritical Whether this is a critical hit
 * @param {number} damage The damage amount to show
 * @param {Function} onComplete Callback when animation completes
 */
export const animateAttack = (
  attackerElement, 
  targetElement, 
  attackType = 'physical', 
  isCritical = false, 
  damage = 0,
  onComplete = () => {}
) => {
  if (!attackerElement || !targetElement) {
    console.error('Cannot animate attack: Missing attacker or target element');
    onComplete();
    return;
  }

  // 1. Add attack preparation class to attacker
  attackerElement.classList.add('battle-animation-attack-prepare');
  
  // Get bounding rectangles for position calculation
  const attackerRect = attackerElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();
  
  // 2. Create attack effect container
  const effectContainer = document.createElement('div');
  effectContainer.className = 'battle-animation-container';
  document.body.appendChild(effectContainer);
  
  // 3. Position the container properly in viewport
  effectContainer.style.position = 'fixed';
  effectContainer.style.top = '0';
  effectContainer.style.left = '0';
  effectContainer.style.width = '100%';
  effectContainer.style.height = '100%';
  effectContainer.style.pointerEvents = 'none';
  effectContainer.style.zIndex = '9997';
  
  // 4. Create attack effect element
  const attackEffect = document.createElement('div');
  
  // Apply the correct attack class based on type and critical
  if (attackType === 'magical') {
    attackEffect.className = `battle-animation-effect ${ANIMATION_CLASSES.ATTACK.MAGICAL}`;
  } else {
    attackEffect.className = `battle-animation-effect ${ANIMATION_CLASSES.ATTACK.PHYSICAL}`;
  }
  
  if (isCritical) {
    attackEffect.classList.add(ANIMATION_CLASSES.ATTACK.CRITICAL);
  }
  
  // 5. Position the effect to start from attacker
  attackEffect.style.position = 'absolute';
  attackEffect.style.top = `${attackerRect.top + (attackerRect.height / 2)}px`;
  attackEffect.style.left = `${attackerRect.left + (attackerRect.width / 2)}px`;
  
  // Add effect to container
  effectContainer.appendChild(attackEffect);
  
  // 6. Calculate target position and set properties for animation
  const targetX = targetRect.left + (targetRect.width / 2);
  const targetY = targetRect.top + (targetRect.height / 2);
  
  // Set animation destination via CSS variables
  attackEffect.style.setProperty('--target-x', `${targetX}px`);
  attackEffect.style.setProperty('--target-y', `${targetY}px`);
  
  // Calculate distance for attack scaling
  const dx = targetX - (attackerRect.left + (attackerRect.width / 2));
  const dy = targetY - (attackerRect.top + (attackerRect.height / 2));
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Set distance for animation scaling
  attackEffect.style.setProperty('--distance', `${distance}px`);
  
  // Calculate angle for proper orientation
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  attackEffect.style.setProperty('--angle', `${angle}deg`);
  
  // 7. Prepare timing variables
  const duration = isCritical ? 
    ANIMATION_DURATIONS.ATTACK_CRITICAL : 
    ANIMATION_DURATIONS.ATTACK;
  
  // 8. Apply animation timing class
  attackEffect.classList.add('animate');
  
  // 9. Make the attacker "lunge" toward target
  attackerElement.style.transition = 'transform 150ms ease-out';
  const lungeDistance = Math.min(30, distance * 0.15);
  const lungeX = (dx / distance) * lungeDistance;
  const lungeY = (dy / distance) * lungeDistance;
  attackerElement.style.transform = `translate(${lungeX}px, ${lungeY}px)`;
  
  // 10. Reset attacker position after small delay
  setTimeout(() => {
    attackerElement.style.transition = 'transform 300ms ease-out';
    attackerElement.style.transform = '';
  }, 150);
  
  // 11. Play impact effect at halfway point
  setTimeout(() => {
    // Make target flash and shake
    targetElement.classList.add('battle-animation-hit');
    
    // Add impact effect at target position
    const impactEffect = document.createElement('div');
    impactEffect.className = `battle-animation-impact ${attackType === 'magical' ? 'magical' : 'physical'}`;
    if (isCritical) impactEffect.classList.add('critical');
    
    impactEffect.style.position = 'absolute';
    impactEffect.style.top = `${targetY}px`;
    impactEffect.style.left = `${targetX}px`;
    effectContainer.appendChild(impactEffect);
    
    // Show damage number if provided
    if (damage > 0) {
      showDamageNumber(targetElement, damage, attackType, isCritical);
    }
    
    // Remove impact after animation completes
    setTimeout(() => {
      impactEffect.remove();
    }, 600);
  }, duration / 2);
  
  // 12. Cleanup and callback after animation completes
  setTimeout(() => {
    effectContainer.remove();
    attackerElement.classList.remove('battle-animation-attack-prepare');
    targetElement.classList.remove('battle-animation-hit');
    onComplete();
  }, duration);
};

/**
 * Displays a floating damage number above the target
 * @param {HTMLElement} targetElement Element to show damage above
 * @param {number} amount The amount of damage/healing
 * @param {string} type 'physical', 'magical', or 'heal'
 * @param {boolean} isCritical If this is a critical hit
 */
export const showDamageNumber = (
  targetElement, 
  amount,
  type = 'physical',
  isCritical = false
) => {
  if (!targetElement) return;
  
  const targetRect = targetElement.getBoundingClientRect();
  
  // Create damage number element
  const damageElement = document.createElement('div');
  
  // Determine the class based on type and critical status
  let className = '';
  if (amount < 0) {
    className = ANIMATION_CLASSES.DAMAGE_TEXT.HEAL;
    amount = Math.abs(amount); // Make healing positive for display
  } else if (type === 'magical') {
    className = ANIMATION_CLASSES.DAMAGE_TEXT.MAGICAL;
  } else {
    className = ANIMATION_CLASSES.DAMAGE_TEXT.PHYSICAL;
  }
  
  if (isCritical) {
    className += ` ${ANIMATION_CLASSES.DAMAGE_TEXT.CRITICAL}`;
  }
  
  damageElement.className = `battle-animation-damage-text ${className}`;
  
  // Format the amount - negative for damage, positive for healing
  if (amount < 0) {
    damageElement.textContent = `+${Math.abs(amount)}`;
  } else {
    damageElement.textContent = `-${amount}`;
  }
  
  // Position above the target with a slight random x-offset for multiple hits
  const xOffset = (Math.random() * 40) - 20; // -20 to +20px
  
  damageElement.style.position = 'fixed';
  damageElement.style.top = `${targetRect.top - 20}px`;
  damageElement.style.left = `${targetRect.left + (targetRect.width / 2) + xOffset}px`;
  damageElement.style.transform = 'translate(-50%, -50%)';
  damageElement.style.zIndex = '9998';
  
  // Add to body
  document.body.appendChild(damageElement);
  
  // For critical hits, add a "CRITICAL!" label
  if (isCritical) {
    const criticalLabel = document.createElement('div');
    criticalLabel.className = 'battle-animation-critical-label';
    criticalLabel.textContent = 'CRITICAL!';
    criticalLabel.style.position = 'fixed';
    criticalLabel.style.top = `${targetRect.top - 40}px`;
    criticalLabel.style.left = `${targetRect.left + (targetRect.width / 2)}px`;
    criticalLabel.style.transform = 'translate(-50%, -50%)';
    criticalLabel.style.zIndex = '9998';
    
    document.body.appendChild(criticalLabel);
    
    // Remove after animation
    setTimeout(() => {
      criticalLabel.remove();
    }, ANIMATION_DURATIONS.DAMAGE_NUMBER);
  }
  
  // Remove after animation
  setTimeout(() => {
    damageElement.remove();
  }, ANIMATION_DURATIONS.DAMAGE_NUMBER);
};

/**
 * Animates a defend action
 * @param {HTMLElement} defenderElement The defender's card element
 * @param {Function} onComplete Callback when animation completes
 */
export const animateDefend = (defenderElement, onComplete = () => {}) => {
  if (!defenderElement) {
    console.error('Cannot animate defend: Missing defender element');
    onComplete();
    return;
  }
  
  // Add defend animation class
  defenderElement.classList.add('battle-animation-defending');
  
  // Create shield effect element
  const shieldEffect = document.createElement('div');
  shieldEffect.className = 'battle-animation-shield';
  
  // Position the shield effect relative to the defender
  const rect = defenderElement.getBoundingClientRect();
  shieldEffect.style.position = 'fixed';
  shieldEffect.style.top = `${rect.top + (rect.height / 2)}px`;
  shieldEffect.style.left = `${rect.left + (rect.width / 2)}px`;
  shieldEffect.style.transform = 'translate(-50%, -50%)';
  shieldEffect.style.zIndex = '9998';
  
  // Add shield to body
  document.body.appendChild(shieldEffect);
  
  // Clean up after animation completes
  setTimeout(() => {
    shieldEffect.remove();
    defenderElement.classList.remove('battle-animation-defending');
    onComplete();
  }, ANIMATION_DURATIONS.DEFEND);
};

/**
 * Animates a spell cast between caster and target
 * @param {HTMLElement} casterElement The spellcaster element
 * @param {HTMLElement} targetElement The spell target element
 * @param {Object} spell The spell object being cast
 * @param {number} damage The amount of damage/healing
 * @param {Function} onComplete Callback when animation completes
 */
export const animateSpell = (
  casterElement,
  targetElement,
  spell,
  damage = 0,
  onComplete = () => {}
) => {
  if (!casterElement || !targetElement) {
    console.error('Cannot animate spell: Missing caster or target element');
    onComplete();
    return;
  }
  
  // 1. Determine spell type from spell object
  let spellType = ANIMATION_CLASSES.SPELL.DEFAULT;
  
  // Analyze spell properties to determine visual type
  if (spell) {
    const spellName = (spell.name || '').toLowerCase();
    const spellEffect = (spell.spell_effect || '').toLowerCase();
    const spellType = (spell.spell_type || '').toLowerCase();
    
    if (spellEffect === 'heal' || spellName.includes('heal') || 
        spellType === 'heal' || damage < 0) {
      spellType = ANIMATION_CLASSES.SPELL.HEAL;
    } 
    else if (spellName.includes('fire') || spellName.includes('flame') ||
             spellName.includes('burn') || spellEffect === 'surge') {
      spellType = ANIMATION_CLASSES.SPELL.FIRE;
    }
    else if (spellName.includes('ice') || spellName.includes('frost') ||
             spellName.includes('freez')) {
      spellType = ANIMATION_CLASSES.SPELL.ICE;
    }
    else if (spellName.includes('lightning') || spellName.includes('thunder') ||
             spellName.includes('shock') || spellName.includes('bolt')) {
      spellType = ANIMATION_CLASSES.SPELL.LIGHTNING;
    }
    else if (spellName.includes('dark') || spellName.includes('shadow') || 
             spellName.includes('void') || spellName.includes('death')) {
      spellType = ANIMATION_CLASSES.SPELL.DARK;
    }
    else if (spellEffect === 'buff' || spellName.includes('buff') || 
             spellName.includes('boost') || spellName.includes('enhance')) {
      spellType = ANIMATION_CLASSES.SPELL.BUFF;
    }
  }
  
  // 2. Add casting animation to caster
  casterElement.classList.add('battle-animation-casting');
  
  // 3. Create casting circle effect around caster
  const castingCircle = document.createElement('div');
  castingCircle.className = `battle-animation-casting-circle ${spellType}`;
  
  // Position casting circle
  const casterRect = casterElement.getBoundingClientRect();
  castingCircle.style.position = 'fixed';
  castingCircle.style.top = `${casterRect.top + (casterRect.height / 2)}px`;
  castingCircle.style.left = `${casterRect.left + (casterRect.width / 2)}px`;
  castingCircle.style.transform = 'translate(-50%, -50%)';
  castingCircle.style.zIndex = '9997';
  
  // Add to body
  document.body.appendChild(castingCircle);
  
  // 4. Create projectile after brief casting time
  setTimeout(() => {
    // Hide casting circle
    castingCircle.classList.add('fade-out');
    
    // Create spell projectile
    const projectile = document.createElement('div');
    projectile.className = `battle-animation-spell-projectile ${spellType}`;
    
    // Get caster and target positions
    const casterRect = casterElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position the projectile to start from caster
    projectile.style.position = 'fixed';
    projectile.style.top = `${casterRect.top + (casterRect.height / 2)}px`;
    projectile.style.left = `${casterRect.left + (casterRect.width / 2)}px`;
    projectile.style.zIndex = '9998';
    
    // Calculate target position
    const targetX = targetRect.left + (targetRect.width / 2);
    const targetY = targetRect.top + (targetRect.height / 2);
    
    // Calculate distance and angle
    const dx = targetX - (casterRect.left + (casterRect.width / 2));
    const dy = targetY - (casterRect.top + (casterRect.height / 2));
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Set animation properties
    projectile.style.setProperty('--target-x', `${targetX}px`);
    projectile.style.setProperty('--target-y', `${targetY}px`);
    projectile.style.setProperty('--distance', `${distance}px`);
    projectile.style.setProperty('--angle', `${angle}deg`);
    
    // Add to body
    document.body.appendChild(projectile);
    
    // Add animation class
    projectile.classList.add('animate');
    
    // 5. Play impact effect after projectile reaches target
    setTimeout(() => {
      // Create impact effect
      const impact = document.createElement('div');
      impact.className = `battle-animation-spell-impact ${spellType}`;
      
      // Position impact
      impact.style.position = 'fixed';
      impact.style.top = `${targetY}px`;
      impact.style.left = `${targetX}px`;
      impact.style.transform = 'translate(-50%, -50%)';
      impact.style.zIndex = '9998';
      
      // Add to body
      document.body.appendChild(impact);
      
      // Add hit effect to target
      targetElement.classList.add('battle-animation-spell-hit');
      
      // Show damage number if provided
      if (damage !== 0) {
        showDamageNumber(
          targetElement, 
          damage, 
          'magical', 
          false
        );
      }
      
      // Clean up impact after animation
      setTimeout(() => {
        impact.remove();
        targetElement.classList.remove('battle-animation-spell-hit');
      }, 500);
    }, 400); // Time for projectile to reach target
    
    // 6. Clean up projectile
    setTimeout(() => {
      projectile.remove();
    }, 500); // Time for projectile animation
  }, 400); // Initial casting time
  
  // 7. Clean up and callback
  setTimeout(() => {
    castingCircle.remove();
    casterElement.classList.remove('battle-animation-casting');
    onComplete();
  }, ANIMATION_DURATIONS.SPELL);
};

/**
 * Animates tool usage from user to target
 * @param {HTMLElement} userElement The tool user element
 * @param {HTMLElement} targetElement The tool target element
 * @param {Object} tool The tool object being used
 * @param {Function} onComplete Callback when animation completes
 */
export const animateTool = (
  userElement, 
  targetElement, 
  tool, 
  onComplete = () => {}
) => {
  if (!userElement || !targetElement) {
    console.error('Cannot animate tool: Missing user or target element');
    onComplete();
    return;
  }
  
  // 1. Determine tool type based on properties
  let toolType = ANIMATION_CLASSES.TOOL.DEFAULT;
  
  if (tool) {
    const toolName = (tool.name || '').toLowerCase();
    const toolEffect = (tool.tool_effect || '').toLowerCase();
    const toolType = (tool.tool_type || '').toLowerCase();
    
    if (toolEffect === 'Shield' || toolName.includes('shield') || 
        toolName.includes('protect') || toolName.includes('armor')) {
      toolType = ANIMATION_CLASSES.TOOL.SHIELD;
    }
    else if (toolEffect === 'Surge' || toolName.includes('damage') || 
             toolName.includes('attack') || toolName.includes('sword')) {
      toolType = ANIMATION_CLASSES.TOOL.DAMAGE;
    }
    else if (toolType === 'stamina' || toolName.includes('heal') || 
             toolName.includes('regen') || toolName.includes('potion')) {
      toolType = ANIMATION_CLASSES.TOOL.HEALING;
    }
    else if (toolName.includes('buff') || toolName.includes('boost') || 
             toolName.includes('enhance')) {
      toolType = ANIMATION_CLASSES.TOOL.BUFF;
    }
  }
  
  // 2. Create tool icon element
  const toolIcon = document.createElement('div');
  toolIcon.className = `battle-animation-tool-icon ${toolType}`;
  
  // 3. Position at user
  const userRect = userElement.getBoundingClientRect();
  toolIcon.style.position = 'fixed';
  toolIcon.style.top = `${userRect.top + 20}px`;
  toolIcon.style.left = `${userRect.left + (userRect.width / 2)}px`;
  toolIcon.style.transform = 'translate(-50%, -50%) scale(0)';
  toolIcon.style.zIndex = '9998';
  
  // 4. Add to body
  document.body.appendChild(toolIcon);
  
  // 5. Animation sequence
  
  // First, scale up the icon
  setTimeout(() => {
    toolIcon.style.transition = 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)';
    toolIcon.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 50);
  
  // Then float icon to target
  setTimeout(() => {
    const targetRect = targetElement.getBoundingClientRect();
    toolIcon.style.transition = 'all 500ms cubic-bezier(0.22, 1, 0.36, 1)';
    toolIcon.style.top = `${targetRect.top + 20}px`;
    toolIcon.style.left = `${targetRect.left + (targetRect.width / 2)}px`;
  }, 400);
  
  // Scale down and apply effect
  setTimeout(() => {
    // Add effect to target
    targetElement.classList.add(`battle-animation-tool-${toolType}-target`);
    
    // Scale down icon
    toolIcon.style.transition = 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)';
    toolIcon.style.transform = 'translate(-50%, -50%) scale(0)';
    toolIcon.style.opacity = '0';
    
    // Create effect aura
    const effectAura = document.createElement('div');
    effectAura.className = `battle-animation-tool-effect ${toolType}`;
    
    const targetRect = targetElement.getBoundingClientRect();
    effectAura.style.position = 'fixed';
    effectAura.style.top = `${targetRect.top + (targetRect.height / 2)}px`;
    effectAura.style.left = `${targetRect.left + (targetRect.width / 2)}px`;
    effectAura.style.transform = 'translate(-50%, -50%)';
    effectAura.style.zIndex = '9997';
    
    document.body.appendChild(effectAura);
    
    // Remove effect after animation
    setTimeout(() => {
      effectAura.remove();
      targetElement.classList.remove(`battle-animation-tool-${toolType}-target`);
    }, 500);
  }, 900);
  
  // 6. Clean up and callback
  setTimeout(() => {
    toolIcon.remove();
    onComplete();
  }, ANIMATION_DURATIONS.TOOL);
};

/**
 * Animates a turn transition
 * @param {string} activePlayer The new active player ('player' or 'enemy')
 * @param {number} turn The new turn number
 */
export const animateTurnTransition = (activePlayer, turn) => {
  // Create transition element
  const transition = document.createElement('div');
  transition.className = `battle-animation-turn-transition ${activePlayer}`;
  
  // Add turn indicator
  transition.innerHTML = `
    <div class="battle-animation-turn-number">Turn ${turn}</div>
    <div class="battle-animation-turn-player">${activePlayer === 'player' ? 'Your Turn' : 'Enemy Turn'}</div>
  `;
  
  // Add to body
  transition.style.position = 'fixed';
  transition.style.top = '0';
  transition.style.left = '0';
  transition.style.width = '100%';
  transition.style.height = '100%';
  transition.style.display = 'flex';
  transition.style.flexDirection = 'column';
  transition.style.justifyContent = 'center';
  transition.style.alignItems = 'center';
  transition.style.pointerEvents = 'none';
  transition.style.zIndex = '9999';
  
  document.body.appendChild(transition);
  
  // Remove after animation
  setTimeout(() => {
    transition.classList.add('fade-out');
    setTimeout(() => {
      transition.remove();
    }, 300);
  }, ANIMATION_DURATIONS.TURN_TRANSITION - 300);
};

/**
 * Shows AI thinking animation on an enemy card
 * @param {HTMLElement} enemyElement The enemy card element
 * @param {boolean} isComplex Whether this is a complex decision
 * @param {Function} onComplete Callback when animation completes
 */
export const showAIThinking = (enemyElement, isComplex = false, onComplete = () => {}) => {
  if (!enemyElement) {
    console.error('Cannot show AI thinking: Missing enemy element');
    onComplete();
    return;
  }
  
  // Create thinking indicator
  const thinking = document.createElement('div');
  thinking.className = 'battle-animation-ai-thinking';
  
  // Add dots
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'battle-animation-ai-thinking-dot';
    thinking.appendChild(dot);
  }
  
  // Position above enemy
  const rect = enemyElement.getBoundingClientRect();
  thinking.style.position = 'fixed';
  thinking.style.top = `${rect.top - 20}px`;
  thinking.style.left = `${rect.left + (rect.width / 2)}px`;
  thinking.style.transform = 'translate(-50%, -50%)';
  thinking.style.zIndex = '9998';
  
  // Add to body
  document.body.appendChild(thinking);
  
  // Highlight enemy card
  enemyElement.classList.add('battle-animation-ai-active');
  
  // Calculate duration based on complexity
  const duration = isComplex ? 
    ANIMATION_DURATIONS.AI_THINKING.COMPLEX : 
    ANIMATION_DURATIONS.AI_THINKING.NORMAL;
  
  // Clean up and callback
  setTimeout(() => {
    thinking.remove();
    enemyElement.classList.remove('battle-animation-ai-active');
    onComplete();
  }, duration);
};

/**
 * Creates and animates a screen flash effect
 * @param {string} color The flash color (hex or rgba)
 * @param {number} duration How long the flash lasts in ms
 * @param {number} intensity Flash opacity (0.0-1.0)
 */
export const screenFlash = (color = '#fff', duration = 300, intensity = 0.3) => {
  // Create flash element
  const flash = document.createElement('div');
  flash.className = 'battle-animation-screen-flash';
  
  // Set style
  flash.style.position = 'fixed';
  flash.style.top = '0';
  flash.style.left = '0';
  flash.style.width = '100%';
  flash.style.height = '100%';
  flash.style.backgroundColor = color;
  flash.style.opacity = '0';
  flash.style.pointerEvents = 'none';
  flash.style.zIndex = '9996';
  
  // Add to body
  document.body.appendChild(flash);
  
  // Animate
  requestAnimationFrame(() => {
    flash.style.transition = `opacity ${duration / 2}ms ease-in`;
    flash.style.opacity = intensity.toString();
    
    setTimeout(() => {
      flash.style.transition = `opacity ${duration / 2}ms ease-out`;
      flash.style.opacity = '0';
      
      setTimeout(() => {
        flash.remove();
      }, duration / 2);
    }, duration / 2);
  });
};

/**
 * Shakes the entire battlefield for emphasis
 * @param {number} intensity Shake intensity (1-10)
 * @param {number} duration Shake duration in ms
 */
export const shakeScreen = (intensity = 5, duration = 500) => {
  // Get the battlefield element
  const battlefield = document.querySelector('.battlefield');
  if (!battlefield) return;
  
  // Scale intensity to reasonable pixels
  const pixelIntensity = Math.min(10, Math.max(1, intensity)) * 1.5;
  
  // Apply shake animation
  battlefield.style.animation = `battle-animation-shake ${duration}ms ease-in-out`;
  
  // Set shake intensity via CSS vars
  battlefield.style.setProperty('--shake-intensity', `${pixelIntensity}px`);
  
  // Reset after animation completes
  setTimeout(() => {
    battlefield.style.animation = '';
  }, duration);
};

/**
 * Generates particles at a target position
 * @param {HTMLElement} targetElement Element to generate particles at
 * @param {string} particleType Type of particles ('damage', 'heal', etc)
 * @param {number} count Number of particles to generate
 */
export const generateParticles = (targetElement, particleType = 'damage', count = 10) => {
  if (!targetElement) return;
  
  const rect = targetElement.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Create particle container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '9995';
  
  document.body.appendChild(container);
  
  // Generate particles
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = `battle-animation-particle ${particleType}`;
    
    // Randomize particle properties
    const angle = Math.random() * 360;
    const distance = Math.random() * 50 + 20;
    const size = Math.random() * 8 + 4;
    const duration = Math.random() * 1000 + 500;
    
    // Set initial position
    particle.style.position = 'absolute';
    particle.style.top = `${centerY}px`;
    particle.style.left = `${centerX}px`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Set animation properties
    particle.style.setProperty('--angle', `${angle}deg`);
    particle.style.setProperty('--distance', `${distance}px`);
    particle.style.setProperty('--duration', `${duration}ms`);
    
    // Add to container
    container.appendChild(particle);
    
    // Add animation class
    particle.classList.add('animate');
    
    // Remove after animation
    setTimeout(() => {
      particle.remove();
    }, duration);
  }
  
  // Clean up container after all particles are gone
  setTimeout(() => {
    container.remove();
  }, 2000);
};

/**
 * Gets the DOM element for a creature by ID
 * @param {string} creatureId The creature's ID
 * @param {boolean} isEnemy Whether it's an enemy creature
 * @returns {HTMLElement|null} The creature's DOM element or null
 */
export const getCreatureElement = (creatureId, isEnemy = false) => {
  // Build selector for the creature card
  const selector = `.${isEnemy ? 'battlefield-enemy' : 'battlefield-player'} .creature-card[data-id="${creatureId}"]`;
  return document.querySelector(selector);
};

/**
 * Wrapper for consistent animation timing
 * @param {Function} animationFunction Function that starts animation
 * @param {number} delay Optional delay before starting
 * @returns {Promise} Promise that resolves when animation completes
 */
export const animateWithTiming = (animationFunction, delay = 0) => {
  return new Promise(resolve => {
    setTimeout(() => {
      animationFunction(() => resolve());
    }, delay);
  });
};

export default {
  animateAttack,
  animateDefend,
  animateSpell,
  animateTool,
  animateTurnTransition,
  showAIThinking,
  showDamageNumber,
  screenFlash,
  shakeScreen,
  generateParticles,
  getCreatureElement,
  animateWithTiming
};
