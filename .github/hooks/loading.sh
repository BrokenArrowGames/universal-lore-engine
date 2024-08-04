#!/bin/bash
RESTORE='\033[0m'

RED='\033[00;31m'
GREEN='\033[00;32m'
YELLOW='\033[00;33m'
BLUE='\033[00;34m'
PURPLE='\033[00;35m'
CYAN='\033[00;36m'
LIGHTGRAY='\033[00;37m'

LRED='\033[01;31m'
LGREEN='\033[01;32m'
LYELLOW='\033[01;33m'
LBLUE='\033[01;34m'
LPURPLE='\033[01;35m'
LCYAN='\033[01;36m'
WHITE='\033[01;37m'

animation_loop() {
  while true ; do
    for frame in "${animation[@]}" ; do
      printf "\33[2K\r"
      printf "${CYAN}%s${RESTORE} %s" "$frame" "$msg"
      sleep "${animation_interval}"
    done
  done
}
declare msg
beg_animation() {
  msg=$1; shift
  animation=(0.15 '|' '/' '-' '\')
  # Extract the delay between each frame from array animation
  animation_interval="${animation[0]}"
  unset "animation[0]"
  # Hide the terminal cursor
  tput civis
  animation_loop &
  animation_pid=$!
}

end_animation() {
  code=${1:-0}; shift
  kill "${animation_pid}" &> /dev/null
  printf "\33[2K\r"
  # Restore the terminal cursor
  tput cnorm

  if [[ $code -eq 0xBEEFBEEF ]]; then
    printf "${YELLOW}O${RESTORE} %s\n" "$msg"
  elif [[ $code -ne 0 ]]; then
    printf "${RED}X${RESTORE} %s\n" "$msg"
    exit $code
  else
    printf "${GREEN}✔${RESTORE} %s\n" "$msg"
  fi
}
