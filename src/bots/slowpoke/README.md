# slowpoke-bot
## Description
A Discord computation bot for Pokemon GO. 

Slowpoke bot extracts all data from the mined game master file and uses only this source for any calculations performed. Any ranking/rating metrics are based on the calculation methods outlined in [this Reddit post](https://www.reddit.com/r/TheSilphRoad/comments/5v0svt/updated_pok%C3%A9mon_go_species_data_and_moveset/).

Slowpoke can be used for various purposes, here are just a few:
- Display Pokemon spec profile including movesets (ranked by weave DPS)
- Predict all possible `atk/def/sta`, `hp`, `iv` stats given a Pokemon's cp and level
- Predict all possible `atk/def/sta`, `hp`, `cp` stats given level for IV% > 90
- Display move information including relevant metrics such as damage, energy gain/energy consumption, and move duration

## Examples
### IV Prediction (`!pd <Pokemon> cp <#> level <#>`): 
<img alt="Slowpoke IV Prediction" src="../../../assets/media/slowpoke-iv-prediction-1.png" width="300">

### CP Prediction (`!pd <Pokemon> level <#>`):
<img alt="Slowpoke CP Prediction" src="../../../assets/media/slowpoke-cp-prediction-1.png" width="300">

