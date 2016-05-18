<td><%- player.getNumber() %></td>
<td><input type="text" class="form-control name" name="name" id="name" 
value="<%- player.getName() %>"/></td>
<td><input type="text" class="form-control city" name="city" id="city" 
value="<%- player.getCity() %>"/></td>
<td><input type="text" class="form-control faction awesomplete" name="faction" id="faction" 
value="<%- player.getFaction() %>" list="factions"/>
</td>
<td><button type="button" class="btn btn-danger removePlayer" id="removePlayer">X</button></td> 
