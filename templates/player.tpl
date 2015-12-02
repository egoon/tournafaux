<td><%- player.getNumber() %></td>
<td><input type="text" class="form-control name" name="name" id="name" 
value="<%- player.getName() %>"/></td>
<td><input type="text" class="form-control city" name="city" id="city" 
value="<%- player.getCity() %>"/></td>
<td><input type="text" class="form-control faction awesomplete" name="faction" id="faction" 
value="<%- player.getFaction() %>" list="factions"/>
</td>
<td class="chooseFirstOpponent">
	<select class="form-control chooseFirstOpponent" name="chooseFirstOpponent" id="chooseFirstOpponent" value="<%- player.getFirstOpponent() %>">
    <option>Random</option>
    <% _.each(opponents, function(opp) { %>
      <option value="<%- opp.id %>"><%- opp.getName() %></option>
    <% }); %>
  </select>
</td>
<td><button type="button" class="btn btn-danger removePlayer" id="removePlayer">X</button></td> 
